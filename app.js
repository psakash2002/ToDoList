const express=require("express");
const bodyParser = require("body-parser");
const app=express();
//const date = require(__dirname+"/views/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"))
app.set('view engine', 'ejs');
let task="";
mongoose.connect("mongodb+srv://admin:Test-123@cluster0.yrvpoic.mongodb.net/todolist");
const itemsSchema = new mongoose.Schema({
    name:String
});
const Item = mongoose.model("Item", itemsSchema);
const item1 = new Item({
    name:"Welcome to your to do list"
})
const item2 = new Item({
    name:"Hit + button to add your task"
})
const item3 = new Item({
    name:"<-- Hit this button to remove an item"
})
const defaultItems = [item1,item2,item3];
const listSchema={
    name:String,
    items:[itemsSchema]
}
const List=mongoose.model("List",listSchema);
app.get("/",function(req,res){
    //let currentday=date();
    Item.find()
    .then(function(foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems)
            .then(function(){
                console.log("Successfully inserted default items");
            })
            .catch(function(err){
                console.log(err);
            })
            res.redirect("/");
        }
        else{
            res.render("list",{kindOfTask:"Today", newTasks:foundItems});   
        }
    })
    .catch(function(err){
        console.log(err);
    })
})
app.get("/:customListName", function(req,res){
    const customListName=_.capitalize(req.params.customListName);
    List.findOne({name:customListName})
        .then(function(foundList){
            if(!foundList){
                const list = new List({
                    name:customListName,
                    items:defaultItems
                });
                list.save();
                res.redirect("/"+customListName);
            }
            else{
                res.render("list",{kindOfTask:foundList.name, newTasks:foundList.items})
            }
    })

})
app.post("/", function(req,res){
    const itemName=req.body.task;
    const listName=req.body.list;
    const item = new Item({
        name:itemName
    });
    if(listName == "Today"){
        item.save();
        res.redirect("/");
    }
    else{
        List.findOne({name:listName})
        .then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        })
    }
    
    /* if(req.body.list === "Work Task"){
        workTasks.push(task);
        res.redirect("/work");
    }
    else{
        tasks.push(task);
        res.redirect("/");
    }
 */})
 app.post("/delete", function(req,res){
    const checkedItemId=req.body.checkbox;
    const listName = req.body.listName;
    if(listName === "Today"){
        Item.findByIdAndRemove({_id:checkedItemId})
        .then(function(){
            res.redirect("/");
        })
    }
    else{
        List.findOneAndUpdate({name: listName}, {$pull:{items:{_id:checkedItemId}}})
        .then(function(err, foundList){
            if(!err){
                res.redirect("/"+listName);
            }
        })
    }
 })
app.get("/work", function(req,res){
    res.render("list",{kindOfTask: "Work Task", newTasks:workTasks})
})
app.get("/about", function(req,res){
    res.render("about");
})
app.listen(3000,function(){
    console.log("Server is running")
})