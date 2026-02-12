





SERVER SIDE
MIDDLEWARE = BASICALLY IT IS A PIECE OF CODE THAT SITS IN THE MIDDLE IN BETWEEN THE CLIENT AND SERVER SIDE RENDERING  , AND IT EXECUTES, HANDLES AND MODIFIES IN BETWEEN THE REQUEST AND BUSINESS LOGIC AND IN RETURN RESPONSE AND CLIENT  , IT CAN BE USED FOR AUTHENTICATION, LOGGING, ERROR HANDLING, ETC.
CONTROLLER = IT IS AN REQUEST HANDLER WHICH IS RESPONSIBLE FOR HANDLING THE INCOMING REQUESTS AND SENDING BACK THE APPROPRIATE RESPONSE TO THE CLIENT, IT ACTS AS AN INTERFACE BETWEEN THE MODEL AND VIEW IN MVC ARCHITECTURE.THE MAIN BUSINNESS LOGIC OF THE APPLICATION IS IMPLEMENTED IN THE CONTROLLER , IT PROCEES THE REQUEST AND APPLIES THE BUSINESS LOGIC AND THEN SENDS THE RESPONSE BACK TO THE CLIENT.
MODEL = IT REPRESNETS THE DATA AND DATA SCHEMA OF THE APPLICATION, IT DEFINES THE STRUCTURE OF THE DATA AND HOW IT IS STORED IN THE DATABASE, IT ALSO CONTAINS THE BUSINESS LOGIC RELATED TO THE DATA, SUCH AS VALIDATION, RELATIONSHIPS, ETC.

                CLIENT (Browser / App)
                        |
                        v
                 Incoming HTTP Request
                        |
                        v
                  ┌─────────────┐
                  │  MIDDLEWARE │
                  │ (auth, log, │
                  │ validation) │
                  └──────┬──────┘
                         |
                         v
                  ┌─────────────┐
                  │ CONTROLLER  │
                  │ (handles    │
                  │ request)    │
                  └──────┬──────┘
                         |
                         v
                  ┌─────────────┐
                  │   MODEL     │
                  │ (DB logic)  │
                  └──────┬──────┘
                         |
                         v
                    DATABASE
                         |
                         v
                  ┌─────────────┐
                  │ CONTROLLER  │
                  │ sends       │
                  │ response    │
                  └──────┬──────┘
                         |
                         v
                    HTTP RESPONSE
                         |
                         v
                       CLIENT
