ELEVENTY=node_modules/.bin/eleventy

doc:
	$(ELEVENTY) --input=docs --config=docs/.eleventy.js
.PHONY: doc

deploy:
	aws s3 sync _site s3://thisrobot.life --delete
.PHONY: deploy