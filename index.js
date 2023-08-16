const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect('mongodb+srv://berkaykalinn:LWUJ3WYH7HPn@cluster0.gjukcpd.mongodb.net/todolistDB');

const itemsSchema=new mongoose.Schema({
  name:{
    type:String,
    required:[true,"Lütfen string değer giriniz !!!"]
  }
});

const item=mongoose.model("Item",itemsSchema);

const listSchema=new mongoose.Schema({
  name:String,
  items:[itemsSchema]

})

const List=mongoose.model("List",listSchema);

const buyFood=new item({
  name: "Buy Food",
});

const cookFood=new item({
  name: "Cook Food",
});

const eatFood=new item({
  name: "Eat Food",
});

const defaultItems=[buyFood,cookFood,eatFood];

// item.insertMany(defaultItems)
// .catch(function(err){
//   console.log(err);
// })


app.get("/", async function(req, res) {
  try {
    const foundItems = await item.find({});
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  } catch (err) {
    console.log(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/:customListName", async function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  try {
    const foundList = await List.findOne({ name: customListName });
    if (!foundList) {
      const list=new List({
        name:customListName,
        items:[]
      })
      list.save();
      res.redirect("/" + customListName);
    } else {
      res.render("list",{listTitle:foundList.name , newListItems:foundList.items})
    }
  } catch (err) {
    console.log("Error:", err);
  }
  // const list=new List({
  //   name:customListName,
  //   items:defaultItems
  // })

  // list.save();
  // console.log("Başarıyla kaydedildi")
});

app.post("/", async function(req, res){
  const itemName = req.body.newItem;
  const listName=req.body.list;
  const itemm= new item({
    name: itemName,
  });
  try {
    if (listName === "Today") {
      itemm.save(); 
      res.redirect("/");
    } else {
      const foundList=await List.findOne({name:listName})
      foundList.items.push(itemm);
      foundList.save();
      res.redirect("/" + listName);
    }
    
  } catch (err) {
    console.log(err);
  }

});

app.post("/delete", async function(req, res){
  const listName=req.body.listName;
  const checkItemId = req.body.checkbox;
  try {
    if (listName === "Today") {
      await item.findByIdAndRemove(checkItemId);
      console.log("Successfully deleted the item.");
      res.redirect("/");
    } else {
      const foundList=await List.findOneAndUpdate({name:listName},{$pull:{items: {_id:checkItemId}}});
      res.redirect("/" + listName);
    }
  } catch (err) {
    console.log(err);
  }
});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
