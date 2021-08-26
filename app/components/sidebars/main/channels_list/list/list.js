// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
/* eslint-disable max-lines */

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {intlShape} from 'react-intl';
import {
    Dimensions,
    findNodeHandle,
    Keyboard,
    Platform,
    SectionList,
    Text,
    TouchableHighlight,
    View,
} from 'react-native';

import {showModal} from '@actions/navigation';
import CompassIcon from '@components/compass_icon';
import ChannelItem from '@components/sidebars/main/channels_list/channel_item';
import ThreadsSidebarEntry from '@components/sidebars/main/threads_entry';
import {DeviceTypes, ListTypes, NavigationTypes} from '@constants';
import {SidebarSectionTypes} from '@constants/view';
import {debounce} from '@mm-redux/actions/helpers';
import {General} from '@mm-redux/constants';
import {CategoryTypes} from '@mm-redux/constants/channel_categories';
import EventEmitter from '@mm-redux/utils/event_emitter';
import BottomSheet from '@utils/bottom_sheet';
import {t} from '@utils/i18n';
import {preventDoubleTap} from '@utils/tap';

const VIEWABILITY_CONFIG = {
    ...ListTypes.VISIBILITY_CONFIG_DEFAULTS,
    waitForInteraction: true,
};

let UnreadIndicator = null;

export default class List extends PureComponent {
    static propTypes = {
        testID: PropTypes.string,
        styles: PropTypes.object.isRequired,
        theme: PropTypes.object.isRequired,
        onSelectChannel: PropTypes.func.isRequired,
        onCollapseCategory: PropTypes.func.isRequired,
        canJoinPublicChannels: PropTypes.bool.isRequired,
        canCreatePrivateChannels: PropTypes.bool.isRequired,
        canCreatePublicChannels: PropTypes.bool.isRequired,
        collapsedThreadsEnabled: PropTypes.bool,
        unreadChannelIds: PropTypes.array.isRequired,
        favoriteChannelIds: PropTypes.array.isRequired,
        orderedChannelIds: PropTypes.array.isRequired,
        channelsByCategory: PropTypes.object,
        categories: PropTypes.array,
        showLegacySidebar: PropTypes.bool.isRequired,
        unreadChannels: PropTypes.array,
        unreadsOnTop: PropTypes.bool.isRequired,
    };

    static contextTypes = {
        intl: intlShape,
    };

    constructor(props) {
        super(props);

        this.combinedActionsRef = React.createRef();

        this.state = {
            sections: this.buildSections(props),
            categorySections: this.buildCategorySections(),
            showIndicator: false,
            width: 0,
        };

        this.keyboardDismissProp = {
            keyboardDismissMode: Platform.OS === 'ios' ? 'interactive' : 'none',
            onScrollBeginDrag: this.scrollBeginDrag,
        };

        CompassIcon.getImageSource('close', 24, this.props.theme.sidebarHeaderTextColor).then((source) => {
            this.closeButton = source;
        });
    }

    componentDidMount() {
        if (!UnreadIndicator) {
            UnreadIndicator = require('app/components/sidebars/main/channels_list/unread_indicator').default;
        }
    }

    setSections(sections) {
        this.setState({sections});
    }
    setCategorySections(categorySections) {
        this.setState({categorySections});
    }

    componentDidUpdate(prevProps, prevState) {
        const {
            canCreatePrivateChannels,
            orderedChannelIds,
            unreadChannelIds,
            channelsByCategory,
            categories,
            showLegacySidebar,
        } = prevProps;

        if (this.props.canCreatePrivateChannels !== canCreatePrivateChannels ||
            this.props.unreadChannelIds !== unreadChannelIds ||
            this.props.orderedChannelIds !== orderedChannelIds ||
            this.props.channelsByCategory !== channelsByCategory ||
            this.props.categories !== categories ||
            this.props.showLegacySidebar !== showLegacySidebar) {
            this.setSections(this.buildSections(this.props));
            this.setCategorySections(this.buildCategorySections());
        }

        if (prevState.sections !== this.state.sections && this.listRef?._wrapperListRef?.getListRef()._viewabilityHelper) { //eslint-disable-line
            this.listRef.recordInteraction();
            this.updateUnreadIndicators({
                viewableItems: Array.from(this.listRef._wrapperListRef.getListRef()._viewabilityHelper._viewableItems.values()) //eslint-disable-line
            });
        }
    }

    setListRef = (ref) => {
        this.listRef = ref;
    }

    getSectionConfigByType = (props, sectionType) => {
        const {canCreatePrivateChannels, canJoinPublicChannels} = props;

        switch (sectionType) {
        case SidebarSectionTypes.UNREADS:
            return {
                id: t('mobile.channel_list.unreads'),
                defaultMessage: 'UNREADS',
            };
        case SidebarSectionTypes.FAVORITE:
            return {
                id: t('sidebar.favorite'),
                defaultMessage: 'FAVORITES',
            };
        case SidebarSectionTypes.PUBLIC:
            return {
                action: canJoinPublicChannels ? this.goToMoreChannels : null,
                id: t('sidebar.channels'),
                defaultMessage: 'PUBLIC CHANNELS',
            };
        case SidebarSectionTypes.PRIVATE:
            return {
                action: canCreatePrivateChannels ? this.goToCreatePrivateChannel : null,
                id: t('sidebar.pg'),
                defaultMessage: 'PRIVATE CHANNELS',
            };
        case SidebarSectionTypes.DIRECT:
            return {
                action: this.goToDirectMessages,
                id: t('sidebar.direct'),
                defaultMessage: 'DIRECT MESSAGES',
            };
        case SidebarSectionTypes.RECENT_ACTIVITY:
            return {
                action: this.showCreateChannelOptions,
                id: t('sidebar.types.recent'),
                defaultMessage: 'RECENT ACTIVITY',
            };
        case SidebarSectionTypes.ALPHA:
            return {
                action: this.showCreateChannelOptions,
                id: t('mobile.channel_list.channels'),
                defaultMessage: 'CHANNELS',
            };
        default:
            return {
                action: this.showCreateChannelOptions,
                id: t('mobile.channel_list.channels'),
                defaultMessage: 'CHANNELS',
            };
        }
    };

    buildSections = (props) => {
        const {
            orderedChannelIds,
        } = props;

        const sections = orderedChannelIds.map((s) => {
            return {
                ...this.getSectionConfigByType(props, s.type),
                data: s.items,
            };
        });

        return sections;
    };

    showCreateChannelOptions = () => {
        const {formatMessage} = this.context.intl;
        const {
            canJoinPublicChannels,
            canCreatePrivateChannels,
            canCreatePublicChannels,
        } = this.props;

        const moreChannelsText = formatMessage({id: 'more_channels.title', defaultMessage: 'Browse for a Channel'});
        const newChannelText = formatMessage({id: 'mobile.create_channel', defaultMessage: 'Create a new Channel'});
        const newDirectChannelText = formatMessage({id: 'mobile.more_dms.title', defaultMessage: 'Add a Conversation'});
        const cancelText = formatMessage({id: 'mobile.post.cancel', defaultMessage: 'Cancel'});
        const options = [];
        const actions = [];

        if (canJoinPublicChannels) {
            actions.push(this.goToMoreChannels);
            options.push({text: moreChannelsText, icon: 'globe'});
        }

        if (canCreatePrivateChannels || canCreatePublicChannels) {
            actions.push(this.goToCreatePublicChannel);
            options.push({text: newChannelText, icon: 'plus'});
        }

        actions.push(this.goToDirectMessages);
        options.push({text: newDirectChannelText, icon: 'account-plus-outline'});
        options.push(cancelText);

        const cancelButtonIndex = options.length - 1;

        BottomSheet.showBottomSheetWithOptions({
            anchor: this.combinedActionsRef?.current ? findNodeHandle(this.combinedActionsRef.current) : null,
            options,
            title: 'Add Channels',
            cancelButtonIndex,
        }, (value) => {
            if (value !== cancelButtonIndex) {
                actions[value]();
            }
        });
    };

    goToCreatePublicChannel = preventDoubleTap(() => {
        const {intl} = this.context;
        const screen = 'CreateChannel';
        const title = intl.formatMessage({id: 'mobile.create_channel.public', defaultMessage: 'New Public Channel'});
        const passProps = {
            channelType: General.OPEN_CHANNEL,
            closeButton: this.closeButton,
        };

        EventEmitter.emit(NavigationTypes.CLOSE_MAIN_SIDEBAR);
        showModal(screen, title, passProps);
    });

    goToCreatePrivateChannel = preventDoubleTap(() => {
        const {intl} = this.context;
        const screen = 'CreateChannel';
        const title = intl.formatMessage({id: 'mobile.create_channel.private', defaultMessage: 'New Private Channel'});
        const passProps = {
            channelType: General.PRIVATE_CHANNEL,
            closeButton: this.closeButton,
        };

        EventEmitter.emit(NavigationTypes.CLOSE_MAIN_SIDEBAR);
        showModal(screen, title, passProps);
    });

    goToCreateChannel = preventDoubleTap(() => {
        const {intl} = this.context;
        const screen = 'CreateChannel';
        const title = intl.formatMessage({id: 'mobile.create_channel', defaultMessage: 'Create a new Channel'});
        const passProps = {
            channelType: General.OPEN_CHANNEL,
            closeButton: this.closeButton,
        };

        EventEmitter.emit(NavigationTypes.CLOSE_MAIN_SIDEBAR);
        showModal(screen, title, passProps);
    });

    goToDirectMessages = preventDoubleTap(() => {
        const {intl} = this.context;
        const screen = 'MoreDirectMessages';
        const title = intl.formatMessage({id: 'mobile.more_dms.title', defaultMessage: 'New Conversation'});
        const passProps = {};
        const options = {
            topBar: {
                leftButtons: [{
                    id: 'close-dms',
                    icon: this.closeButton,
                    testID: 'close.more_direct_messages.button',
                }],
            },
        };

        EventEmitter.emit(NavigationTypes.CLOSE_MAIN_SIDEBAR);
        showModal(screen, title, passProps, options);
    });

    goToMoreChannels = preventDoubleTap(() => {
        const {intl} = this.context;
        const screen = 'MoreChannels';
        const title = intl.formatMessage({id: 'more_channels.title', defaultMessage: 'More Channels'});
        const passProps = {
            closeButton: this.closeButton,
        };

        EventEmitter.emit(NavigationTypes.CLOSE_MAIN_SIDEBAR);
        showModal(screen, title, passProps);
    });

    keyExtractor = (item) => item.id || item;

    onSelectChannel = (channel, currentChannelId) => {
        const {onSelectChannel} = this.props;
        if (DeviceTypes.IS_TABLET) {
            Keyboard.dismiss();
        }
        onSelectChannel(channel, currentChannelId);
    };

    onLayout = (event) => {
        const {width} = event.nativeEvent.layout;
        this.setState({width: width - 40});
    };

    renderSectionAction = (styles, action, anchor, id) => {
        return (
            <TouchableHighlight
                testID={'action_button_' + id}
                style={styles.actionContainer}
                onPress={action}
                underlayColor={'transparent'}
                hitSlop={styles.hitSlop}
            >
                <CompassIcon
                    name='plus'
                    ref={anchor ? this.combinedActionsRef : null}
                    style={styles.action}
                />
            </TouchableHighlight>
        );
    };

    renderItem = ({item}) => {
        const {testID, favoriteChannelIds, unreadChannelIds} = this.props;
        const channelItemTestID = `${testID}.channel_item`;

        return (
            <ChannelItem
                testID={channelItemTestID}
                channelId={item}
                isUnread={unreadChannelIds.includes(item)}
                isFavorite={favoriteChannelIds.includes(item)}
                onSelectChannel={this.onSelectChannel}
            />
        );
    };

    renderSectionHeader = ({section}) => {
        const {styles} = this.props;
        const {intl} = this.context;
        const {action, defaultMessage, id} = section;

        const anchor = (id === 'sidebar.types.recent' || id === 'mobile.channel_list.channels');

        return (
            <View style={styles.titleContainer}>
                <Text style={styles.title}>
                    {intl.formatMessage({id, defaultMessage}).toUpperCase()}
                </Text>
                <View style={styles.separatorContainer}>
                    <View style={styles.separator}/>
                </View>
                {action && this.renderSectionAction(styles, action, anchor, id)}
            </View>
        );
    };

    renderCategoryItem = ({item, section}) => {
        if (section.collapsed) {
            return null;
        }

        const {testID, favoriteChannelIds, unreadChannelIds} = this.props;
        const channelItemTestID = `${testID}.channel_item`;

        return (
            <ChannelItem
                testID={channelItemTestID}
                channelId={item.id}
                isUnread={unreadChannelIds.includes(item.id)}
                isFavorite={favoriteChannelIds.includes(item.id)}
                onSelectChannel={this.onSelectChannel}
            />
        );
    };

    renderCategoryHeader = ({section}) => {
        const {styles, onCollapseCategory} = this.props;
        const {action, id, name, collapsed, type, data} = section;
        const {intl} = this.context;
        const anchor = (id === 'sidebar.types.recent' || id === 'mobile.channel_list.channels');

        const title = () => {
            switch (type) {
            case CategoryTypes.UNREADS:
                return intl.formatMessage({id: 'mobile.channel_list.unreads', defaultMessage: 'unreads'}).toUpperCase();
            case CategoryTypes.FAVORITES:
                return intl.formatMessage({id: 'sidebar.favorite', defaultMessage: 'favorites'}).toUpperCase();
            case CategoryTypes.CHANNELS:
                return intl.formatMessage({id: 'mobile.channel_list.channels', defaultMessage: 'channels'}).toUpperCase();
            case CategoryTypes.DIRECT_MESSAGES:
                return intl.formatMessage({id: 'sidebar.direct', defaultMessage: 'direct messages'}).toUpperCase();
            default:
                return name.toUpperCase();
            }
        };

        const header = (
            <View style={styles.titleContainer}>
                {(type !== CategoryTypes.UNREADS && data.length > 0) &&
                    <CompassIcon
                        name={collapsed ? 'chevron-right' : 'chevron-down'}
                        ref={anchor ? this.combinedActionsRef : null}
                        style={styles.chevron}
                    />
                }
                <Text style={styles.title}>
                    {title()}
                </Text>
                <View style={styles.separatorContainer}>
                    <Text> </Text>
                </View>
                {action && this.renderSectionAction(styles, action, anchor, id)}
            </View>
        );

        if (type === CategoryTypes.UNREADS) {
            return header;
        }

        return (
            <TouchableHighlight onPress={() => onCollapseCategory(id, !collapsed)}>
                {header}
            </TouchableHighlight>
        );
    }

    buildCategorySections = () => {
        const categoriesBySection = [];

        // Start with Unreads
        if (this.props.unreadChannels.length && this.props.unreadsOnTop) {
            categoriesBySection.push({
                id: 'unreads',
                name: 'UNREADS',
                data: this.props.unreadChannels,
                type: CategoryTypes.UNREADS,
            });
        }

        // Add the rest
        if (this.props.channelsByCategory && this.props.categories) {
            this.props.categories.map((cat) => {
                return categoriesBySection.push({
                    name: cat.display_name,
                    action: cat.type === 'direct_messages' ? this.goToDirectMessages : this.showCreateChannelOptions,
                    data: this.props.channelsByCategory[cat.id],
                    ...cat,
                });
            });
        }

        return categoriesBySection;
    }

    scrollToTop = () => {
        //eslint-disable-next-line no-underscore-dangle
        if (this.listRef?._wrapperListRef) {
            //eslint-disable-next-line no-underscore-dangle
            this.listRef._wrapperListRef.getListRef().scrollToOffset({
                x: 0,
                y: 0,
                animated: true,
            });
        }
    };

    emitUnreadIndicatorChange = debounce((showIndicator) => {
        this.setState({showIndicator});
    }, 10);

    updateUnreadIndicators = ({viewableItems}) => {
        const {unreadChannelIds} = this.props;
        const firstUnread = unreadChannelIds.length && unreadChannelIds[0];
        if (firstUnread && viewableItems.length) {
            const isVisible = viewableItems.find((v) => v.item === firstUnread);

            return this.emitUnreadIndicatorChange(!isVisible);
        }

        return this.emitUnreadIndicatorChange(false);
    };

    scrollBeginDrag = () => {
        if (DeviceTypes.IS_TABLET) {
            Keyboard.dismiss();
        }
    };

    listContentPadding = () => {
        if (DeviceTypes.IS_TABLET) {
            return 64;
        }

        const {width, height} = Dimensions.get('window');
        const landscape = width > height;
        if (DeviceTypes.IS_IPHONE_WITH_INSETS) {
            return landscape ? 54 : 44;
        }

        return 64;
    };

    render() {
        const {testID, styles, theme, showLegacySidebar, collapsedThreadsEnabled} = this.props;
        const {sections, categorySections, showIndicator} = this.state;

        const paddingBottom = this.listContentPadding();
        const indicatorStyle = [styles.above];
        if (collapsedThreadsEnabled) {
            indicatorStyle.push({marginTop: 64});
        }

        return (
            <View
                style={styles.container}
                onLayout={this.onLayout}
            >
                {collapsedThreadsEnabled && (
                    <ThreadsSidebarEntry/>
                )}
                <SectionList
                    ref={this.setListRef}
                    sections={showLegacySidebar ? sections : categorySections}
                    contentContainerStyle={{paddingBottom}}
                    removeClippedSubviews={Platform.OS === 'android'}
                    renderItem={showLegacySidebar ? this.renderItem : this.renderCategoryItem}
                    renderSectionHeader={showLegacySidebar ? this.renderSectionHeader : this.renderCategoryHeader}
                    keyboardShouldPersistTaps={'always'}
                    keyExtractor={this.keyExtractor}
                    onViewableItemsChanged={this.updateUnreadIndicators}
                    maxToRenderPerBatch={10}
                    stickySectionHeadersEnabled={true}
                    testID={testID}
                    viewabilityConfig={VIEWABILITY_CONFIG}
                    {...this.keyboardDismissProp}
                />
                {UnreadIndicator &&
                <UnreadIndicator
                    onPress={this.scrollToTop}
                    theme={theme}
                    style={indicatorStyle}
                    visible={showIndicator}
                />
                }
            </View>
        );
    }
}
