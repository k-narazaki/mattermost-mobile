// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Post} from '@support/ui/component';

class LongPostScreen {
    testID = {
        longPostItem: 'long_post.post',
    }

    getPost = (postId, postMessage, postProfileOptions = {}) => {
        const {
            postItem,
            postItemHeaderDateTime,
            postItemHeaderDisplayName,
            postItemHeaderGuestTag,
            postItemHeaderReply,
            postItemImage,
            postItemMessage,
            postItemProfilePicture,
            postItemProfilePictureUserStatus,
            postItemShowLessButton,
            postItemShowMoreButton,
        } = Post.getPost(this.testID.longPostItem, postId, postMessage, postProfileOptions);

        return {
            longPostItem: postItem,
            longPostItemHeaderDateTime: postItemHeaderDateTime,
            longPostItemHeaderDisplayName: postItemHeaderDisplayName,
            longPostItemHeaderGuestTag: postItemHeaderGuestTag,
            longPostItemHeaderReply: postItemHeaderReply,
            longPostItemImage: postItemImage,
            longPostItemMessage: postItemMessage,
            longPostItemProfilePicture: postItemProfilePicture,
            longPostItemProfilePictureUserStatus: postItemProfilePictureUserStatus,
            longPostItemShowLessButton: postItemShowLessButton,
            longPostItemShowMoreButton: postItemShowMoreButton,
        };
    }

    getPostMessage = () => {
        return Post.getPostMessage(this.testID.longPostItem);
    }
}

const longPostScreen = new LongPostScreen();
export default longPostScreen;
