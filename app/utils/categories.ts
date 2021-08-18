// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {gt, lte} from 'semver';

import {Client4} from '@client/rest';
import {Config} from '@mm-redux/types/config';

export const shouldShowLegacySidebar = (config: Partial<Config>) => {
    const serverVersion = config.Version || Client4.getServerVersion();

    // No server version? Default to legacy.
    if (!serverVersion) {
        return true;
    }

    // Older servers default to Legacy unless experimental flag is set
    if (lte(serverVersion, '5.31.0')) {
        if (config.ExperimentalChannelSidebarOrganization === 'true') {
            return false;
        }
        return true;
    }

    // Newer servers only show legacy if legacy flag is set
    if (gt(serverVersion, '5.31.0') && config.EnableLegacySidebar === 'true') {
        return true;
    }

    // Default to showing categories
    return false;
};
