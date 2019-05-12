const express = require('express');
const router = express.Router();
const Tutor = require('./../model/tutor');

/*  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
*
*       Bulk fetch of tutors by ID
*
*   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   */
router.get('/tutor', (req, res) => {
    const ids = req.query.ids
    Tutor.find({
        "_id":{ "$in" : ids }
    })
        .then(data => {
            res.send(data);
        })
        .catch(error => res.status(404).send(error));
});


module.exports = router;