# 업체(Company / Tenant) CRUD + 페이지

생성자: Hounds
생성 일시: 2026년 1월 9일 오후 11:50
Tag: Account, Administrator, Implementation, Tenant, Week 1~2
최종 편집자:: Hounds
최종 업데이트 시간: 2026년 1월 11일 오전 12:16

<aside>
🌐

BaseUrl : /companies

</aside>

- 개요
    
    <aside>
    👉🏻
    
    ### 업체
    
    업체(Company)는 서비스의 초기 진입 / 각 기능 활성화를 가능하게 하는 엔티티 입니다.
    
    최상위 엔티티로 모든 원소들은 업체 하위에 존재합니다.
    
    </aside>
    
    <aside>
    🗒️
    
    ### 요구 사항
    
    1. Create
        1. 랜딩 페이지에서 업체를 생성 할 수 있습니다. 
            1. 업체를 생성할 시 해당 업체의 초기 관리자(Administrator) 계정이 함께 생성됩니다.
    2. Read
        1. **‘관리자 계정만’** 업체의 상세 정보를 열람할 수 있습니다.
    3. Update
        1. **‘관리자 계정만’** 업체 정보를 변경할 수 있습니다. 
    4. Delete
        1. 관리자 계정에 의해 업체를 삭제 처리 할 수 있습니다.
    
    <aside>
    🌐
    
    예외 사항 : 관리자 계정은 업체의 모든 정보를 열람, 생성, 수정, 삭제 할 수 있습니다.
    
    </aside>
    
    </aside>
    
    <aside>
    🚫
    
    ### 최소 제한 사항
    
    1. Create
        1. 업체 명 또는 companyKey는 중복 생성할 수 없습니다.
            1. 예시: 업체 명 `PNT` 가 이미 있으면 생성 실패 (403)
            2. 예시: 업체 키 `tgdev` 가 이미 있으면 생성 실패 (403)
        2. 업체 생성과 초기 관리자 계정 생성은 단일 트랜잭션으로 처리됩니다.
        관리자 생성에 실패할 시 업체 또한 롤백 처리 합니다.
            1. 예시: 이미 존재하는 관리자 계정(ID 등) 이면 업체까지 롤백 처리
            
    2. Update
        1. 업체 상호 간의 수정 요청은 불가합니다.
            1. 예시: A 업체가 B 업체의 정보 수정을 요청 (403 거부)
        2. 업체의 고유한 정보는 변경할 수 없습니다.
            1. 예시: companyKey 변경
            
    3. Delete
        1. 삭제는 논리 삭제만 허용합니다.
            1. 의도하지 않게 업체를 날리는 경우 물리 삭제 시 업체에 귀속된 모든 정보가 사라집니다.
            2. 논리 삭제를 통해 회생 가능성을 열어두고 복구 플래그로 사용합니다.
        2. 업체 상호 간의 삭제 요청은 불가합니다.
            1. 예시: A 업체가 B 업체 삭제를 요청 (403 거부) ❌
    </aside>
    
- 업체 생성 요청
    
    ### ↔️ Endpoint
    
    - HttpMethod:  POST
    - URL : /public/companies
    
    ### ↪️ Request
    
    ```jsx
    Endpoint : /public/companies (POST)
    
    {
      "companyKey": "tgdev",
      "companyName": "Team Ganadi Dev",
      "address": "서울특별시 강남구 테헤란로 123",
      "contactEmail": "ganadi@ganadi.com",
      "contactTel": "02-000-0000",
      "admin": {
        "email": "admin@tgdev.com",
        "password": "P@ssw0rd!234",
        "name": "가나디"
      }
    }
    ```
    
    | field | type | isRequired | isAllowedEmpty | description | restrictions |
    | --- | --- | --- | --- | --- | --- |
    | companyKey | String | ✅ | ❌ | 업체 고유 키 | 길이 / 허용 문자 자유롭게 구현 |
    | companyName | String | ✅ | ❌ | 업체 명 | 길이 / 허용 문자 자유롭게 구현 |
    | address | String | ❌ | ✅ | 업체 주소 | 길이 / 허용 문자 자유롭게 구현 |
    | contactEmail | String | ❌ | ✅ | CS 이메일 | 길이 / 허용 문자 자유롭게 구현 |
    | contactTel | String | ❌ | ✅ | CS 연락처 | 길이 / 허용 문자 자유롭게 구현 |
    | admin | Object | ✅ | ❌ | 관리자 계정 정보 |  |
    | admin.email | String | ✅ | ❌ | 이메일 | 길이 / 허용 문자 자유롭게 구현 |
    | admin.password | String | ✅ | ❌ | 비밀번호  | 길이 / 허용 문자 자유롭게 구현 |
    | admin.name | String | ✅ | ❌ | 이름 | 길이 / 허용 문자 자유롭게 구현 |
    
    ### ↩️ Response
    
    ```jsx
    Endpoint : /public/companies (POST)
    HttpStatus : 200 OK / 201 CREATED
    
    body 
    {
    	"success":true,
    	"data":{
    	  "companyId": 1001,
    	  "companyKey": "tgdev",
    	  "companyName": "Team Ganadi Dev",
    	  "adminUserId": 501,
    	  "status": "ACTIVE"
    	},
    	"extensions":{}
    }
    ```
    
    | 필드명 | 타입 | isRequired | isAllowedEmpty | 설명 |
    | --- | --- | --- | --- | --- |
    | success | boolean | ✅ | ❌ | 요청 성공 여부 (성공 시 항상 true) |
    | data | object | ✅ | ❌ | 응답 데이터 (API 별로 구조가 달라짐 / 필수) |
    | data.companyId | Long | ✅ | ❌ | 업체 id (데이터베이스 시퀀스) |
    | data.companyKey | String | ✅ | ❌ | 업체 고유 키 |
    | data.companyName | String | ✅ | ❌ | 업체 명 |
    | data.adminUserId | Long | ✅ | ❌ | 관리자 id (데이터베이스 시퀀스) |
    | data.status | String | ✅ | ❌ | 업체 상태 (ACTIVE / BLOCKED / DELETED) |
    | data.createdAt | Long | ✅ | ❌ | 생성 일시 (UNIXTIME) |
    | extensions | object | ✅ | ✅ | 확장 데이터 (필요 시 자유롭게 사용) |
- 업체 수정 요청
    
    ### ↔️ Endpoint
    
    - HttpMethod : PATCH
    - URL :  Endpoint : /companies/{companyId} (PATCH)
    
    ### ↪️ Request
    
    ```jsx
    Endpoint : /companies/{companyId} (PATCH)
    
    {
      "companyName": "더개발스(본사)",
      "contactEmail": "support@ganadi.com",
      "contactPhone": "02-1234-5678",
      "address": "서울특별시 강남구 삼성로 123"
    }
    ```
    
    | path | type | description |
    | --- | --- | --- |
    | companyId | numeric | 업체 ID (데이터베이스 시퀀스) |
    
    | field | type | isRequired | isAllowedEmpty | description | restrictions |
    | --- | --- | --- | --- | --- | --- |
    | companyName | String | ✅ | ❌ | 업체 명 | 생성과 동일한 제한 적용 |
    | address | String | ❌ | ✅ | 업체 주소 | 생성과 동일한 제한 적용 |
    | contactEmail | String | ❌ | ✅ | CS 이메일 | 생성과 동일한 제한 적용 |
    | contactTel | String | ❌ | ✅ | CS 연락처 | 생성과 동일한 제한 적용 |
    
    ### ↩️ Response
    
    ```jsx
    Endpoint : /companies/{companyId} (PATCH)
    HttpStatus : 200 OK
    
    {
      "success": true,
      "data": {
        "companyId": 1001,
        "companyKey": "tgdev",
        "companyName": "김박배",
        "status": "ACTIVE",
        "contactEmail": "support@kpb.com",
        "contactPhone": "02-1234-5678",
        "address": "서울특별시 관악구 인헌동 1234",
        "updatedAt": "1768030496"
      },
      "extensions": {}
    }
    ```
    
    | 필드명 | 타입 | isRequired | isAllowedEmpty | 설명 |
    | --- | --- | --- | --- | --- |
    | success | boolean | ✅ | ❌ | 요청 성공 여부 (성공 시 항상 true) |
    | data | object | ✅ | ❌ | 응답 데이터 (API 별로 구조가 달라짐 / 필수) |
    | data.companyId | Long | ✅ | ❌ | 업체 id (데이터베이스 시퀀스) |
    | data.companyKey | String | ✅ | ❌ | 업체 고유 키 |
    | data.companyName | String | ✅ | ❌ | 업체 명 |
    | data.status | String | ✅ | ❌ | 업체 상태 (ACTIVE / SUSPENDED / DELETED) |
    | data.updateAt | Long | ✅ | ❌ | 업데이트 일시 (UNIXTIME) |
    | data.contactEmail | String | ❌ | ✅ | CS 이메일 |
    | data.contactPhone | String | ❌ | ✅ | CS 전화번호 |
    | data.address | String | ❌ | ✅ | 회사 주소 |
    | extensions | object | ✅ | ✅ | 확장 데이터 (필요 시 자유롭게 사용) |
- 업체 삭제 요청
    
    ### ↔️ Endpoint
    
    - HttpMethod : DELETE
    - URL : /companies/{companyId}
    
    ### ↪️ Request
    
    ```jsx
    Endpoint : /companies/{companyId} (DELETE)
    
    without body
    ```
    
    | path | type | description |
    | --- | --- | --- |
    | companyId | numeric | 업체 ID (데이터베이스 시퀀스) |
    
    ### ↩️ Response
    
    ```jsx
    Endpoint : /companies/{companyId} (DELETE)
    HttpStatus : 200 OK
    
    {
      "success": true,
      "data": {},
      "extensions": {}
    }
    ```
    
    | 필드명 | 타입 | isRequired | isAllowedEmpty | 설명 |
    | --- | --- | --- | --- | --- |
    | success | boolean | ✅ | ❌ | 요청 성공 여부 (성공 시 항상 true) |
    | data | object | ✅ | ✅ | 응답 데이터 (API 별로 구조가 달라짐 / 필수) |
    | extensions | object | ✅ | ✅ | 확장 데이터 (필요 시 자유롭게 사용) |
- 업체 정보 상세 조회
    
    ### ↔️ Endpoint
    
    - HttpMethod : DELETE
    - URL : /companies/{companyId}
    
    ### ↪️ Request
    
    ```jsx
    Endpoint : /companies/{companyId} (GET)
    
    without param
    ```
    
    | path | type | description |
    | --- | --- | --- |
    | companyId | numeric | 업체 ID (데이터베이스 시퀀스) |
    
    ### ↩️ Response
    
    ```jsx
    Endpoint : /companies/{companyId} (GET)
    HttpStatus : 200 OK
    
    {
      "success": true,
      "data": {
        "companyId": 1001,
        "companyKey": "tgdev",
        "companyName": "김박배",
        "status": "DELETED",
        "createdAt": 1768030496,
        "suspendedAt": null,
        "suspendedUntil": null,
        "contactEmail": "support@kpb.com",
        "contactPhone": "02-1234-5678",
        "address": "서울특별시 관악구 인헌동 1234",
        "updatedAt": 1768030496
        "deletedAt": 1768030496
      },
      "extensions": {}
    }
    ```
    
    | 필드명 | 타입 | isRequired | isAllowedEmpty | 설명 |
    | --- | --- | --- | --- | --- |
    | success | boolean | ✅ | ❌ | 요청 성공 여부 (성공 시 항상 true) |
    | data | object | ✅ | ❌ | 응답 데이터 (API 별로 구조가 달라짐 / 필수) |
    | data.companyId | Long | ✅ | ❌ | 업체 id (데이터베이스 시퀀스) |
    | data.companyKey | String | ✅ | ❌ | 업체 고유 키 |
    | data.companyName | String | ✅ | ❌ | 업체 명 |
    | data.status | String | ✅ | ❌ | 업체 상태 (ACTIVE / SUSPENDED/ DELETED) |
    | data.createdAt | Long | ✅ | ❌ | 생성 일시(UNIXTIME) |
    | data.suspendedAt | Long | ❌ | ❌ | 정지 일시 (UNIXTIME) / 상태가 BLOCKED 라면 필수 |
    | data.suspendedUntil | Long | ❌ | ❌ | 정지 기간 (UNIXTIME)  / 상태가 BLOCKED 라면 필수 |
    | data.contactEmail | String | ❌ | ✅ | CS 이메일 |
    | data.contactPhone | String | ❌ | ✅ | CS 전화번호 |
    | data.address | String | ❌ | ✅ | 회사 주소 |
    | data.updateAt | Long | ❌ | ❌ | 업데이트 일시 (UNIXTIME) |
    | data.deletedAt | Long | ❌ | ❌ | 삭제 일시 (UNIXTIME) / isDeleted가 true라면 필수 |
    | extensions | object | ✅ | ✅ | 확장 데이터 (필요 시 자유롭게 사용) |
- Errors
    
    <aside>
    🚫
    
    ### Company Domain Error Codes
    
    </aside>
    
    ## 1. 4xx 계열
    
    ### 1 - 1 400 (Bad  Request)
    
    | code | description |
    | --- | --- |
    | COMPANY_400_001 | 이미 존재하는 companyKey |
    | COMPANY_400_002 | 이미 존재하는 companyName |
    | COMPANY_400_003 | 문자열 범위 초과 |
    | COMPANY_400_004 | 유효하지 않은 문자 포함 |
    | COMPANY_400_005 | 이미 존재하는 Admin 이메일 |
    | COMPANY_400_006 | 업체를 찾을 수 없음. |
    
    ```jsx
    HttpStatus: 400(Bad Request)
    
    {
    	"success":false,
    	"error":{
    		"code":"COMPANY_400_001",
    		"message":"이미 존재하는 업체 key."
    	},
    	"extensions":{ << 선택입니다.
    	 	"requested": {
    	 	   "companyKey": "someKey",
    	 	   "companyName": "어떤 이름"
    	 	}
    	}
    }
    ```
    
    ### 1 - 2 403 (Forbidden)
    
    | code | description |
    | --- | --- |
    | COMPANY_403_001 | 타사의 요청 (다른 회사 자원 접근) |
    | COMPANY_403_002 | 이미 정지된 업체 |
    | COMPANY_403_003 | 이미 삭제된 업체 |
    
    ```jsx
    HttpStatus: 403(Forbidden)
    
    {
    	"success":false,
    	"error":{
    		"code":"COMPANY_403_001",
    		"message":"타사 정보 침해 행위"
    	},
    	"extensions":{}
    }
    ```
    
    ## 2. 5xx 계열
    
    ### 2 - 1 500 (Internal Server Error)
    
    | code | description |
    | --- | --- |
    | COMPANY_500_001 | 서비스 레이어 에러 |
    
    ```jsx
    HttpStatus: 500(Internal Server Error)
    
    {
    	"success":false,
    	"error":{
    		"code":"COMPANY_500_001",
    		"message":"서버 에러는 API쪽 좀 보고 생각나는데로 채우겠습니다. 맨날 200만 던지니까 딱히 생각나는 케이스가 지금은 없네요."
    	},
    	"extensions":{}
    }
    ```