const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  suite('POST REQUESTS', function(){

    test("POST REQUEST CREATE ISSUE WITH EVERY FIELD", function(done){
      chai
      .request(server)
      .post('/api/issues/project')
      .send({
        issue_title: "first",
        issue_text: "second",
        created_by: "third",
        assigned_to: "fourth",
        status_text: "fifth"
      })
      .end((err, res) => {
        assert.equal(res.body.issue_title, "first")
        assert.equal(res.body.issue_text, "second")
        assert.equal(res.body.created_by, "third")
        assert.equal(res.body.assigned_to, "fourth")
        assert.equal(res.body.status_text, "fifth")
        done();
      });
    });

    test("POST REQUEST CREATE ISSUE ONLY REQUIRED FIELD", function(done){
      chai
      .request(server)
      .post('/api/issues/project')
      .send({
        issue_title: "first",
        issue_text: "second",
        created_by: "third"
      })
      .end((err, res) => {
        assert.equal(res.body.issue_title, "first")
        assert.equal(res.body.issue_text, "second")
        assert.equal(res.body.created_by, "third")
        assert.equal(res.body.assigned_to, "")
        assert.equal(res.body.status_text, "")
        done();
      });
    });

    test("POST REQUEST MISSING REQUIRED FIELDS", function(done){
      chai
      .request(server)
      .post('/api/issues/project')
      .send({
        created_by: "third",
        assigned_to: "fourth",
        status_text: "fifth"
      })
      .end((err, res) => {
        assert.equal(res.body.issue_title, undefined)
        done(err);
      });
    });
  });

  suite('GET REQUESTS', function(){
    test("GET REQUEST ISSUES", function(done){
      chai
      .request(server)
      .get('/api/issues/project')
      .end((err, res) => {
        assert.equal(res.body.length, 19)
        done();
      });
    });
    test("GET REQUEST FILTER ISSUES", function(done){

    })
    

  });
  
});
