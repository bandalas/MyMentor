const express = require('express');
const router = express.Router();

const Class = require('./../model/class');

router.get('/class', (req, res) => {
    var search_params = {}
    if(req.body.name) {
        search_params.name = req.body.name
    }
    if(req.body.area) {
        search_params.area = req.body.area
    }
    if(req.body.subject) {
        search_params.subject = req.body.subject
    }
    if(req.body.cost) {
        search_params.cost = { $lte: req.body.cost }
    }
    if(req.body.average) {
        search_params.tutor_rating = { $gte: req.body.average }
    }
    if(req.body.startDate && req.body.endDate){
        search_params.date = {$gte: req.body.startDate, $lt: req.body.endDate}
    }

    Class.find(search_params)
     .then(matches => {
        console.log(matches);
        res.json(matches);
     })
     .catch(error => res.status(404).send(error.message))
});

module.exports = router;
