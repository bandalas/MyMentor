const express = require('express');
const router = express.Router();

const { getQuery, renameId } = require('../core/admin-helper');
const auth = require('../middleware/admin-auth');

router.get('/', auth, (req, res) => {
  const Model = require(`../model/${res.locals.model}`);
  const q = getQuery(req.url);

  Model.find().skip(q.skip).limit(q.limit).sort(q.sort)
  .then(records => {
    let arrRecords = records.map(renameId);
    console.log(arrRecords);

    Model.countDocuments()
      .then(count => {
        res.header('X-Total-Count', count).json(arrRecords);
      })
      .catch(error => res.status(400).send(error.message))
  })
  .catch(error => res.json(400).send(error.message));
});

router.get('/:id', auth, (req, res) => {
  const Model = require(`../model/${res.locals.model}`);

  Model.findOne({ _id: req.params.id })
  .then(result => {
    let record = result.toObject();
    record.id = record._id;
    delete record._id;

    console.log(record);
    res.json(record);
  })
  .catch(error => res.json(400).send(error.message));
})

router.delete('/:id', auth, (req, res) => {
  const Model = require(`../model/${res.locals.model}`);

  Model.deleteOne({ _id: req.params.id })
  .then(result => {
    console.log(result);
    res.json(result);
  })
  .catch(error => res.json(400).send(error.message));
})

module.exports = router;