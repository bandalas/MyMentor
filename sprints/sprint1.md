## Sprint 1
    
#### Signup de Tutores - POST de localhost:3000/tutors/signup
   * Body:
   
          {
            "firstName": "Test",
            "lastName": "Test",
            "email": "test@test.mx",
            "password": "123456789",
            "institution": "itesm",
            "semester":  8,
            "img": "imagen",
            "description": "Test",
            "category": "Lenguas",
            "gpa": 4.0
          }
          
          
  * Respuesta:
      
      <img src="https://i.imgur.com/Bs6ImmG.png">
      
  * Respuesta Header (**auth token**):
      
      <img src="https://imgur.com/GGUDZKH.png">

#### Login de Tutores - POST de localhost:3000/auth
  * Body:
 
        {
          "email": "test@test.mx",
          "password": "123456789"
        }

  * Respuesta (**auth token**):
      
      <img src="https://imgur.com/106hr9f.png">
      
#### Autenticación de Tutores Logueados - GET de localhost:3000/tutors/dashboard
  Se manda el token que se regresó en **login** dentro del header `x-auth-token`
  
  * Respuesta:
  
      <img src="https://imgur.com/XEB7CZr.png">

#### Tutor puede ver sus clases dadas de alta - GET de localhost:3000/tutors/classes

  * Respuesta:
  
      <img src="https://imgur.com/iEErQl9.png">

#### Tutor puede dar de alta clases - POST de localhost:3000/tutors/class
  * Body:
  
        {
          "name": "TEST",
          "date": "2014-01-01",
          "subject": "test",
          "area": "Lenguas",
          "availability": ["lu", "ju"],
          "description": "test",
          "cost": 3.1416
        }
    
  * Respuesta:
    
      <img src="https://imgur.com/BPzOC68.png">

#### Tutor puede editar clases - PUT de localhost:3000/tutors/class/:id
  * Body:
  
        {
          "name": "cambio de nombre",
          "date": "2014-01-01",
          "subject": "test",
          "area": "Lenguas",
          "availability": ["lu", "ju"],
          "description": "test",
          "cost": 3.1416
        }

  * Respuesta:
  
      <img src="https://imgur.com/6GUYE8e.png">

#### Tutor puede borrar clases - DELETE de localhost:3000/tutors/class/:id
  Borra clase de base de datos y retorna la clase borrada

  * Respuesta:
  
      <img src="https://imgur.com/TOKcN60.png">
  