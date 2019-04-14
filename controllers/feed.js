exports.getPosts = (req, res, next) => {

    res.status(200).json({posts: [{title: 'First Post', context: 'This is the first post'}]})
};


exports.postPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
//    create pot in db
    res.status(201).json({
        message: 'Post Created successfully',
        post: {id: new Date().toISOString(), title: title, content: content}
    })
}