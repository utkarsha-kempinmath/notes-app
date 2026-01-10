const express = require('express')
const path = require('path')
const fs = require('fs')
const { log } = require('console')
const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join((__dirname), 'public')))
app.set('view engine', 'ejs')


app.get("/", (req, res) => {
    fs.readdir(`./files`, (err, files) => {
        res.render("index", {files: files})
    })
    
})

app.post("/create", (req, res) => {
    fs.writeFile(`./files/${req.body.title.split(' ').join('')}.txt`, req.body.details, function(err){
    if(err) console.error(err);
    else res.redirect("/")
})
})

app.get(`/files/:filename`, (req, res) => {
    fs.readFile(`files/${req.params.filename}`, "utf-8", (err, filedata) => {
        if(err){
            console.error(err);
        }
        else{
            res.render("show", {filename: req.params.filename, data: filedata})
        }
    })
})

app.get("/edit/:filename", (req, res) => {
    res.render("edit", {filename: req.params.filename})
})

app.post("/edit", (req, res) => {
    fs.rename(`files/${req.body.title}`, `files/${req.body.newTitle}`, function(err){
    if(err) console.error(err);
    else res.redirect("/")
})
})

app.post("/delete/:filename", (req, res) => {

  fs.unlink(`./files/${req.params.filename}`, (err) => {
    if (err) {
      console.error(err.message);
    }
    res.redirect("/");
  });
});

app.listen(3000, () =>{
    console.log("working")
})