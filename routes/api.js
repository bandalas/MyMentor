const express = require('express');
const router = express.Router();
const Tutor = require('./../model/tutor');


const Class = require('./../model/class');

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*       Searches a class given different parameters
*
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
router.post('/class', (req, res) => {
    var search_params = { availability: true }

    if(req.body.name) {
        search_params.name = { $regex: req.body.name }
    }
    if(req.body.area) {
        search_params.area = { $regex: req.body.area}
    }
    if(req.body.subject) {
        search_params.subject = { $regex: req.body.subject }
    }
    if(req.body.cost) {
        search_params.cost = { $lte: parseFloat(req.body.cost) }
    }
    if(req.body.average) {
        search_params.tutor_rating = { $gte: req.body.average }
    }
    if(req.body.startDate && req.body.endDate){
        search_params.date = {$gte: req.body.startDate, $lt: req.body.endDate}
    }

    Class.find(search_params)
     .then(matches => {
         let result = []
         matches.forEach((elem) => {
             const id = elem._id;
             Tutor.findOne({ "_id": id})
              .then(t => {
                  matches.tutor = t.firstName +" " + t.lastName;
              })
              .catch(e => {
                  console.log(e);
              })
         })
         res.json(matches);
     })
     .catch(error => {
         console.log(error);
         res.status(404).send(error.message)
        })
});
/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*       Bulk fetch of tutors by ID
*
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
router.get('/tutor', (req, res) => {
    const ids = req.query.ids
    Tutor.find({
        _id:{ $in : ids }
    })
        .then(data => {
            res.send(data);
        })
        .catch(error => res.status(404).send(error));
});


module.exports = router;