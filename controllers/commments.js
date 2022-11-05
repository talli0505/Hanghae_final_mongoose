const CommentsService = require('../services/comments');
const PostsService = require('../services/posts');


class CommentsController {
    commentsService = new CommentsService();
    postsService = new PostsService();

    //전체 댓글 목록 보기
    getComments = async (req, res, next) => {
        const {postId} = req.params;

        try {
            await this.postsService.findOnePost(postId);

            const getAllComments = await this.commentsService.findAllComments(postId);
            res.status(200).json({comments: getAllComments});

        } catch (err) {
            const errormessage = `${req.method} ${req.originalUrl} : ${err.message}`;
            console.log(errormessage);
            res.status(400).json({errormessage});
        }
    };


    //신규 댓글!!
    createComment = async (req, res, next) => {
        try {
            const userId = res.locals.user.id;
            const nickname = res.locals.user.nickname;
            const postId = req.params._id;
            const {comment} = req.body;

            await this.commentsService.findOnePost(postId);

            if (!comment) {
                res.status(412).json({errorMessage: '댓글 내용을 입력해주세요😌'});
                return;
            }

            const createComment = await this.commentsService.createComment(postId, userId, nickname, comment);
            res.status(201).json({message: '댓글을 등록했어요😚', createComment});

        } catch (err) {
            console.log(`${err.message}`);
            res.status(400).send({errorMessage: err.message});
        }
    };


    //댓글 수정
    editComment = async (req, res) => {
        try {
            const userId = res.locals.user.id;
            const commentId = req.params._id;
            const {comment} = req.body;

            //댓글 존재 여부 확인하기
            await this.commentsService.findOneComment(commentId);

            if (comment === "") {
                res.status(412).json({errorMessage: "댓글 내용을 입력해주세요!"});
            }

            //본인의 댓글 맞는지 확인하기
            const whoWroteThisComment = await this.commentsService.findOneComment(commentId);
            if (userId !== whoWroteThisComment.userId) {
                return res.status(400).json({errorMessage: "댓글 작성자 본인만 수정할 수 있어요~!"});
            }

            const updateComment = await this.commentsService.updateComment(userId, commentId, comment);
            res.status(200).json(updateComment);

        } catch (err) {
            if (err.code === -1) {
                res.status(401).send({errorMessage: '댓글 수정 fail,,,'});
            }
            const errormessage = `${req.method} ${req.originalUrl} : ${err.message}`;
            console.log(errormessage);
            res.status(400).json({errormessage});
        }
    };


    //댓글 삭제
    deleteComment = async (req, res) => {
        try {
            const userId = res.locals.user.id;
            const commentId = req.params._id;

            //댓글 존재 여부 확인하기
            await this.commentsService.findOneComment(commentId);

            //본인의 댓글 맞는지 확인하기
            const deleteComment = await this.commentsService.deleteComment(userId, commentId);
            if (deleteComment.deletedCount === 0) {
                return res.status(400).json({errorMessage: "댓글 작성자 본인만 삭제할 수 있어요~!"});
            }

            res.status(200).json({message: "댓글 삭제 완료!!"})
        } catch (err) {
            console.log(`${err.message}`);
            res.status(400).send({errorMessage: err.message});
        }
    };
}

module.exports = CommentsController;