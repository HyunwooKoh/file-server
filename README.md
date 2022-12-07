# 데모용 파일서버

- 간단하게 자동으로 만료되는 파일 서버가 필요할 때 사용하기 위한 간단한 CR~~U~~DL 웹서버

## 환경 변수

- HOST
  - 서버 기동 시 바인딩할 호스트
  - 기본값은 "0.0.0.0"
- PORT
  - 서버 기동 시 바인딩할 포트
  - 기본값은 8080
- FILES_PATH
  - 업로드된 파일들을 저장할 경로
  - 기본값은 현재 실행 디렉터리 기준
- EXPIRE_DELAY
  - 업로드된 파일의 만료 기간으로, 단위는 ms
  - 기본값은 24시간
- EXPIRE_SCHEDULE
  - 파일 만료를 검사하는 스케줄러의 실행 주기로, 단위는 ms
  - 기본값은 1시간

## 구현

> 기본적인 기능은 디렉터리의 파일을 특정 시간에 따라 만료시키는 웹서버에 API로 파일을 등록하는 기능이 추가된 것으로
> 따로 DB 없이 모든 기능들은 API로 등록했는지 여부에 상관없이 동작함

- `GET /basedir` API를 호출하면 `{FILES_PATH}`를 응답
- `GET /files` API를 호출하면 `{FILES_PATH}` 아래의 파일 경로 목록 응답
- `POST /files` API로 파일을 등록하면 UUID를 파일 이름으로 하여 파일을 `{FILES_PATH}` 경로에 저장하고, 파일 경로를 응답
- `GET /files/{fileName}` API를 호출하면 `{FILES_PATH}` 아래 `{fileName}` 파일을 다운로드하고, 없다면 404 오류
- `Delete /files/{fileName}` API를 호출하면 `{FILES_PATH}` 아래 `{fileName}` 파일을 삭제함

## API

### 기본 경로 조회
```shell
# GET /basedir
curl --request GET 'localhost:8080/basedir'
```

### 파일 목록 조회
```shell
# GET /files
curl --request GET 'localhost:8080/files'
```

### 파일 다운로드
```shell
# GET /files/{fileName}
curl --request GET 'localhost:8080/files/test.json'
```

### 파일 업로드
```shell
# POST /files
# Headers
# - Content-Type: multipart/form-data
# Body
# - file: {FILE}
curl --request POST 'localhost:8080/files' --form 'file=@"/C:/Users/user/Downloads/icon_22.png"'
```

### 파일 삭제
```shell
# DELETE /files/{id}
curl --request DELETE 'localhost:8080/files/91f11be9-9c97-4dda-a718-963f1f8a4f6d'
```
