COURSE_NAME="csci4810"
ASSIGNMENT_NAME="hw03"

run:
	# PYTHON
	# source ./bin/activate && python3 src/main.py

	# WEB/JAVASCRIPT
	open http://localhost:8000
	cd src && python3 -m http.server 8000

clean:
	# PYTHON
	rm -rf ./src/__pycache__

push:
	rsync -avz --recursive --delete ./ nike:~/courses/$(COURSE_NAME)/$(ASSIGNMENT_NAME)

pull:
	rsync -avz --recursive --delete nike:~/courses/$(COURSE_NAME)/$(ASSIGNMENT_NAME)/* ./