from __future__ import unicode_literals

from django.db import models

from django.contrib.auth.models import User
from django.utils.timezone import now
import uuid

class Document(models.Model):
	video = models.FileField(upload_to = 'videos/' , blank=True, null=True)
	image = models.FileField(upload_to = 'images/', blank=True, null=True)


class AttendanceLog(models.Model):

	status_choices = (
		('Enter', 'Enter'),
		('Exit', 'Exit'),
	)
	time = models.DateTimeField(default=now())
	person_name = models.CharField(max_length=30)
	# time = models.DateTimeField(blank=True)
	status = models.CharField(max_length=5, choices=status_choices)


class Profile(models.Model):
	username = models.CharField(max_length=30)
	uuid = models.UUIDField(default=uuid.uuid4, max_length=30)
	active = models.BooleanField(default=True)