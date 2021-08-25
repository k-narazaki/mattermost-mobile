// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/* eslint-disable @typescript-eslint/no-explicit-any */

import {showModalOverCurrentContext} from '@actions/navigation';

export default {
    showBottomSheetWithOptions: (options: any, callback: any) => {
        function itemAction(index: any) {
            callback(index);
        }

        const items = options.options.splice(0, options.cancelButtonIndex).map((o: any, index: any) => ({
            action: () => itemAction(index),
            text: o,
        }));

        showModalOverCurrentContext('OptionsModal', {title: options.title || '', items});
    },
};
