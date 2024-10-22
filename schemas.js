const mongoose = require("mongoose");
const { Schema } = mongoose;

const IssueSchema = new Schema({
  assigned_to: String,
  status_text: String,
  open: Boolean,
  _id: {
    type: String,
  },
  issue_title: {
    type: String,
  },
  issue_text: {
    type: String,
  },
  created_by: {
    type: String,
  },
  created_on: Date,
  updated_on: Date
});

const Issue = mongoose.model("Issue", IssueSchema);

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  issues: [IssueSchema]
});

const Project = mongoose.model("Project", ProjectSchema);

exports.Issue = Issue;
exports.Project = Project;

