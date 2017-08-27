#!/usr/bin/env python2
import datetime
import time

from django.utils.timezone import now

start = time.time()
import cv2
import os
import pickle
import numpy as np
from sklearn.mixture import GMM
import openface
from celery.decorators import task
from firebase import firebase
np.set_printoptions(precision=2)

fileDir = os.path.dirname(os.path.realpath(__file__))
modelDir = os.path.join(fileDir, '..', 'models')
dlibModelDir = os.path.join(modelDir, 'dlib')
openfaceModelDir = os.path.join(modelDir, 'openface')

networkModel = os.path.join(
            openfaceModelDir,
            'nn4.small2.v1.t7')

net = openface.TorchNeuralNet(
        networkModel,
        imgDim=96, # 96 is kept as img Dimension
        cuda=False)

dlibFacePredictor = os.path.join(
            dlibModelDir,
            "shape_predictor_68_face_landmarks.dat")

align = openface.AlignDlib(dlibFacePredictor)

classifierModel =  fileDir+'/../generated-embeddings/classifier.pkl'


def getRep(bgrImg):
    global net, align
    start = time.time()
    if bgrImg is None:
        raise Exception("Unable to load image/frame")

    rgbImg = cv2.cvtColor(bgrImg, cv2.COLOR_BGR2RGB)
    start = time.time()

    # Get the largest face bounding box
    # bb = align.getLargestFaceBoundingBox(rgbImg) #Bounding box

    # Get all bounding boxes
    bb = align.getAllFaceBoundingBoxes(rgbImg)

    if bb is None:
        # raise Exception("Unable to find a face: {}".format(imgPath))
        return None

    start = time.time()

    alignedFaces = []
    for box in bb:
        alignedFaces.append(
            align.align(
                96, # args.imgDim is taken as 96
                rgbImg,
                box,
                landmarkIndices=openface.AlignDlib.OUTER_EYES_AND_NOSE))

    if alignedFaces is None:
        raise Exception("Unable to align the frame")

    start = time.time()

    reps = []
    for alignedFace in alignedFaces:
        reps.append(net.forward(alignedFace))
    return reps


def infer(img):
    global classifierModel
    with open(classifierModel, 'r') as f:
        (le, clf) = pickle.load(f)  # le - label and clf - classifer
    reps = getRep(img)
    persons = []
    confidences = []
    for rep in reps:
        try:
            rep = rep.reshape(1, -1)
        except:
            print "No Face detected"
            return (None, None)
        start = time.time()
        predictions = clf.predict_proba(rep).ravel()
        # print predictions
        maxI = np.argmax(predictions)
        # max2 = np.argsort(predictions)[-3:][::-1][1]
        persons.append(le.inverse_transform(maxI))
        # print str(le.inverse_transform(max2)) + ": "+str( predictions [max2])
        # ^ prints the second prediction
        confidences.append(predictions[maxI])

        # print("Predict {} with {:.2f} confidence.".format(person, confidence))
        if isinstance(clf, GMM):
            dist = np.linalg.norm(rep - clf.means_[maxI])
            print("  + Distance from the mean: {}".format(dist))
            pass
    return (persons, confidences)

fire = firebase.FirebaseApplication('https://joshhack-c4c1f.firebaseio.com/', None)

@task()
def mark_attendance(video_path=0, threshold=.7, camera_enter=True):
    video_capture = cv2.VideoCapture(video_path)
    person_data = {}
    ret, frame = video_capture.read()
    video_capture.set(3, 740)
    video_capture.set(4, 360)
    start = time.time()
    while ret:
        persons, confidences = infer(frame)
        print persons
        print confidences
        for i in xrange(len(persons)):
            if confidences[i] > threshold:
                if persons[i] not in person_data or person_data[persons[i]] < now() - datetime.timedelta(minutes=1):
                    person_data[persons[i]] = now()
                    if camera_enter:
                        fire.post_async("/attendance", {'email': persons[i], 'status':"Enter", 'time': person_data[persons[i]].isoformat()})
                    else:
                        fire.post("/attendance", {'email': persons[i], 'status':"Exit", 'time': person_data[persons[i]].isoformat()})
        video_capture.set(0, (time.time()-start)*1000)
        ret, frame = video_capture.read()
        if not video_path:
            cv2.putText(frame, "P: {} C: {}".format(persons, confidences),
                        (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            cv2.imshow('', frame)
            # quit the program on the press of key 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    print time.time() - start
    # When everything is done, release the capture
    video_capture.release()
    cv2.destroyAllWindows()
from recognize.models import Profile
import time
@task()
def check_room(video_path=0, threshold=.7, room_name="one"):
    users = Profile.objects.filter(active=True)
    video_capture = cv2.VideoCapture(video_path)
    person_data = {}
    for user in users:
        person_data[user.username] = {'last_seen':None, 'id': str(user.uuid)}
    ret, frame = video_capture.read()
    start = time.time()
    video_capture.set(3, 740)
    video_capture.set(4, 360)
    while ret:
        persons, confidences = infer(frame)
        for i in xrange(len(persons)):
            if confidences[i] > threshold:
                if person_data.get(persons[i], None) and not person_data[persons[i]]['last_seen']:
                    fire.put_async("/{0}".format(room_name),'/{0}'.format(person_data[persons[i]]['id']),
                                   {'email': persons[i], 'time': now().isoformat()})
                    print persons[i], "enter", confidences[i]
                person_data[persons[i]]['last_seen'] = now()
        for person in person_data:
            if person_data[person]['last_seen'] and person_data[person]['last_seen'] < now() - datetime.timedelta(minutes=1):
                fire.delete_async("/{0}".format(room_name), '/{0}'.format(person_data[person]['id']))
                person_data[person]['last_seen'] = None
                print person, "exit"
        video_capture.set(0, (time.time()-start)*1000)
        ret, frame = video_capture.read()
        if not video_path:
            cv2.putText(frame, "P: {} C: {}".format(persons, confidences),
                        (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            cv2.imshow('', frame)
            # quit the program on the press of key 'q'
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    print time.time() - start
    # When everything is done, release the capture
    video_capture.release()
    cv2.destroyAllWindows()
