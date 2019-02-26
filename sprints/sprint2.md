## Sprint 2

#### Signup de Alumnos - POST de localhost:3000/students/signup
  * Body:

        {
          "firstName": "Test",
          "lastName": "Test",
          "email": "alumno@test.mx",
          "password": "123456789",
          "institution": "itesm",
          "semester":  8,
          "img": "imagen"
        }
  
  * Respuesta:
  
      <img src="https://imgur.com/AMXxfwf.png">
      
  * Respuesta header (**auth token**):
  
      <img src="https://imgur.com/UWJ7Fkj.png">
  
#### Login de Alumnos - POST de localhost:3000/auth
  * Body:
   
        {
          "email": "alumno@test.mx",
          "password": "123456789"
        }

  * Respuesta (**auth token**):
      
      <img src="https://imgur.com/106hr9f.png">

#### Autenticación de Alumnos Logueados - GET de localhost:3000/students/dashboard
  * Respuesta:
      <img src="https://imgur.com/Zc7c7Lr.png">

#### Alumno puede ver clases disponsibles - GET de localhost:3000/students/classes
  * Respuesta:
      <img src="https://imgur.com/32OzfcB.png">
      
#### Alumno puede crear reseña de clase tomada - POST de localhost:3000/students/add-review/:id
  * Body:
   
        {
          "comment": "muy buena clase",
          "stars": 3
        }

  * Respuesta:
      
      <img src="https://imgur.com/KVKV1wX.png">