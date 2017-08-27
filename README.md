# roomvacancydetector
Install pip:
	apt-get update
	apt-get install python-pip

Install boost python:
	apt-get install libboost-all-dev

Install cmake:
	add-apt-repository ppa:george-edison55/cmake-3.x
	apt-get update
	apt-get install cmake

Install dlib:
	pip install dlib

Install opencv:
	wget https://raw.githubusercontent.com/milq/milq/master/scripts/bash/install-opencv.sh
	bash install-opencv.sh
	export PYTHONPATH=/usr/local/lib/python2.7/site-packages/

Install torch:
	git clone https://github.com/torch/distro.git ~/torch --recursive
	cd ~/torch; bash install-deps;
	./install.sh
	source ~/.bashrc	
		
Install few more lua stuff:
	for NAME in dpnn nn optim optnet csvigo cutorch cunn fblualib torchx tds; do luarocks install $NAME; done

Install requirements.txt

# Go through the openCV docs for the basics of openCV

# We are open for the public contribution. Just fork the repo and create a pull reuqest with changes.
