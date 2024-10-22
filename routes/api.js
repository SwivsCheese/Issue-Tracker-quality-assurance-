'use strict';
const mongoose = require('mongoose');
const IssueSchema = require('../schemas').Issue;
const ProjectSchema = require('../schemas').Project;
const db = require('../mongodbStuff');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      const {
        _id,
        open,
        assigned_to,
        status_text,
        issue_title,
        issue_text,
        created_by,
        created_on,
        updated_on
      } = req.query;
      let project = req.params.project;
      

      let returnProject = await ProjectSchema.aggregate([
        { $match: { name: project } },
        { $unwind: "$issues"},
        _id != undefined 
        ? { $match: { "issues._id" : _id } }
        : { $match: {} },
        issue_title != undefined 
        ? { $match: { "issues.issue_title" : issue_title } }
        : { $match: {} },
        issue_text != undefined 
        ? { $match: { "issues.issue_text" : issue_text } }
        : { $match: {} },
        created_on != undefined 
        ? { $match: { "issues.created_on" : created_on } }
        : { $match: {} },
        updated_on != undefined 
        ? { $match: { "issues.updated_on" : updated_on } }
        : { $match: {} },
        created_by != undefined 
        ? { $match: { "issues.created_by" : created_by } }
        : { $match: {} },
        assigned_to != undefined 
        ? { $match: { "issues.assigned_to" : assigned_to } }
        : { $match: {} },
        open != undefined 
        ? { $match: { "issues.open" : JSON.parse(open) } }
        : { $match: {} },
        status_text != undefined 
        ? { $match: { "issues.status_text" : status_text } }
        : { $match: {} }
      ]).exec();

      let mapper = returnProject.map(a => a.issues);
      return res.json(mapper);
    })
    
    .post(async function (req, res){
      // if required fields missing, return error
      let project = req.params.project;
      let newId = new mongoose.Types.ObjectId();

      const {
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to,
        status_text: status_text
      } = req.body;

      if(!issue_title || !issue_text || !created_by ){
        return res.json({ error: 'required field(s) missing'});
      }

      const issued_statement = new IssueSchema({
        assigned_to: assigned_to || "",
        status_text: status_text || "",
        open: true,
        _id: newId.toString(),
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString()
      });
      
      const data = await ProjectSchema.findOne({ name: project });
      if(!data){
        // if there ain't data
        const newProject = new ProjectSchema({
          name: project
        });
        newProject.issues.push(issued_statement);
        let newest = await newProject.save();
        res.json(issued_statement)
        return

      }
      else{
        // if data exists
        data.issues.push(issued_statement);
        let you = await data.save();
        console.log(you);
        res.json(issued_statement)
        return
      }
    })
    
    .put(async function (req, res){
      let project = req.params.project;

      let {
        _id: _id,
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to,
        status_text: status_text,
        open: open
      } = req.body;

      if(!_id){
        res.json({error: 'missing _id'});
        return 
      }

      if(!issue_title && !issue_text && !created_by && !assigned_to && !status_text && !open){
        res.json({"error": 'no update field(s) sent', '_id': _id});
        return 
      }
      
      const data = await ProjectSchema.findOne({ name: project });
      let otherData = data.issues.filter((elem) => elem._id === _id);
      if(otherData.length === 0){
        res.json({"error": "could not update", "_id": _id});
        return 
      }
      else{
        // if other_data[0].title == "" 
        // fix data entered in earlier so if it's empty make it "";
        otherData[0]._id = _id, //this won't change
        otherData[0].issue_title = otherData[0].issue_title != "" ? issue_title : otherData[0].issue_title,
        otherData[0].issue_text = otherData[0].issue_text != "" ? issue_text : otherData[0].issue_text,
        otherData[0].created_on = otherData[0].created_on, // leave this alone
        otherData[0].updated_on = new Date().toISOString(),
        otherData[0].created_by = otherData[0].created_by != "" ? created_by : otherData[0].created_by,
        otherData[0].assigned_to = otherData[0].assigned_to != "" ? assigned_to : otherData[0].assigned_to,
        otherData[0].open = open == undefined ? true : false // eventually change this to be TorF
        otherData[0].status_text = otherData[0].status_text != "" ? status_text : otherData[0].status_text
        data.save();
        return res.json({ "result": "successfully updated", '_id': _id });
      }
    })
    
    .delete(async function (req, res){
      let project = req.params.project;

      const _id = req.body._id;

      if(!_id){
        return res.json({"error": "missing _id"})
      }
      
      const data = await ProjectSchema.findOne({ name: project });

      let why = data.issues.filter((elem) => elem.id.toString() === _id);

      if(why.length === 1){
        data.issues = data.issues.filter((elem) => elem._id.toString() !== _id);
      
        await data.save();

        return res.json({result: "successfully deleted", _id: _id})
      }
      else{
        return res.json({ error: 'could not delete', '_id': _id })
      }
      

      
    });
    
};
