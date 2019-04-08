const Student = require('./../model/student');
/*
*
*   Creating random data for user of type student, for test purposes only
*
*/

function createStudents (number) {

    for(var i = 1; i<= number; i++) {
        
        const student1 = new Student({
            firstName: 'Student-0'+i,
            lastName: 'Johnson-0'+i,
            email: 'test-0'+i+'@gmail.com',
            password: 'test123',
            institution: 'ITESM',
            semester: i
        });
        console.log(student1);

        student1.save()
            .then(res => console.log(res))
            .catch(reason => console.log(reason));

    }
}

createStudents(3);