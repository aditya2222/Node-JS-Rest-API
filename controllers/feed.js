exports.getPosts = (req, res, next) => {

    res.status(200).json({
        posts: [{
            _id: '1',
            title: 'First Post',
            context: 'This is the first post',
            imageUrl: 'images/duck.jpg',
            creator: {
                name: 'Admin'
            },
            createdAt: new Date().toISOString()
        }]
    })
};


exports.postPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    console.log(title);
    console.log(content);
    //    create pot in db
    res.status(201).json({
        message: 'Post Created successfully',
        post: { _id: new Date().toISOString(), title: title, content: content, creator: 'Author', cretedAt: new Date() }
    })
};


