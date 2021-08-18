// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Config} from '@mm-redux/types/config';

import {shouldShowLegacySidebar} from './categories';

describe('Show Legacy Sidebar', () => {
    const config: Partial<Config> = {
        Version: '5.31.0',
    };

    it('should show on servers <= v5.31.0', () => {
        expect(shouldShowLegacySidebar(config)).toBe(true);

        config.Version = '5.30.0';
        expect(shouldShowLegacySidebar(config)).toBe(true);

        config.Version = '5.32.0';
        expect(shouldShowLegacySidebar(config)).toBe(false);
    });

    it('should not show on older servers if ExperimentalChannelSidebarOrganization is true', () => {
        config.ExperimentalChannelSidebarOrganization = 'true';
        expect(shouldShowLegacySidebar(config)).toBe(false);
    });

    it('should show on newer servers if EnableLegacySidebar is true', () => {
        config.EnableLegacySidebar = 'true';
        config.Version = '5.32.0';
        expect(shouldShowLegacySidebar(config)).toBe(true);
    });
});
