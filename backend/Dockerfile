FROM python:3.12

COPY . app/
WORKDIR /app

RUN pip install -r requirements.txt

ENV PORT 8080

CMD exec waitress-serve --listen=*:$PORT api:app