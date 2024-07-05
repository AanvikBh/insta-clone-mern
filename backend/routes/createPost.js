const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const postSchema = mongoose.model('postSchema')


// Route (remember it is a protected API)
router.post('/createPost', requireLogin, (request, response) => {
    const { body, pic } = request.body
    if (!pic || !body) {
        return response.status(422).json({ error: "Please add all the fields" })
    }

    // initially this will show undefined (in createPost) but will print value (in requireLogin), because requireLogin is getting run after createPost
    // shift the next() function after the id has been found in requireLogin
    // then also we need to store userData in some variable before sending it over
    console.log(request.user)

    const post = new postSchema({
        body: body,
        photo: pic,
        posted_by: request.user
    })
    post.save().then((savedUser) => {
        response.json(savedUser)
    }).catch(err => console.log(err))

})

// display all the posts of that user on home page
// detailed return with populate
router.get("/allposts", requireLogin, (request, response) => {
    postSchema.find()
        .populate("posted_by", "_id name")
        .populate("comments.posted_by", "_id name")
        .then(posts => response.json(posts))
        // .then()
        .catch(err => console.log(err))

})

// to update profile page
router.get('/myposts', requireLogin, (request, response) => {
    postSchema.find({ posted_by: request.user._id })
        .populate("posted_by", "_id name")
        .then(myposts => {
            response.json(myposts)
        })
})


// API to put likes 
router.put("/like", requireLogin, (request, response) => {
    postSchema.findByIdAndUpdate(
        request.body.postId,
        { $push: { likes: request.user._id } },
        { new: true }
    )
        .populate("posted_by", "_id name")
        // .exec((err, result)=>{
        //     if(err){
        //         return response.status(423).json({error:err})
        //     }
        //     else{
        //         response.json(result)
        //     }
        // })
        .then(result => response.json(result))
        .catch(err => {
            console.log(err)
            response.status(423).json({ error: err })
        })
})

// API to remove likes 
router.put("/unlike", requireLogin, (request, response) => {
    postSchema.findByIdAndUpdate(
        request.body.postId,
        { $pull: { likes: request.user._id } },
        { new: true }
    )
        .populate("posted_by", "_id name")
        // .exec((err, result)=>{
        //     if(err){
        //         return response.status(423).json({error:err})
        //     }
        //     else{
        //         response.json(result)
        //     }
        // })
        .then(result => response.json(result))
        .catch(err => {
            console.log(err)
            response.status(423).json({ error: err })
        })
})

// API to add comment
router.put("/comment", requireLogin, (request, response) => {
    const new_comment = {
        comment: request.body.text,
        posted_by: request.user._id
    }
    postSchema.findByIdAndUpdate(request.body.postId, {
        $push: { comments: new_comment }
    }, {
        new: true
    })
        .populate("comments.posted_by", "_id name")

        // first posted by returns the comments posted by and not the one of the user under which it is posted
        // so pass it along with another populate
        .populate("posted_by", "_id name")
        .then(result => response.json(result))
        .catch(err => {
            console.log(err)
            response.status(423).json({ error: err })
        })

})


// api to delete post
router.delete("/deletePost/:postID", requireLogin, (request, response) => {
    postSchema.findOne({ id: request.params.postID })
        .populate("posted_by", "_id")
        .then((error, post) => {
            if (error || !post) {
                return response.status(424).json({ error: error })
            }
            // additional check to delete
            // first need to convert them into string as it is returned as a Object
            if (post.posted_by._id.toString() == request.user._id.toString()) {
                post.remove()
                    .then(result => {
                        return response.json({ message: "Successfully Deleted" })
                    })
                    .catch(err => console.log(err))
            }

            // response.json(result)
        })

})

module.exports = router