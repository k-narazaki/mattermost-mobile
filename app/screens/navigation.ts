// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {Appearance, DeviceEventEmitter, Keyboard, Platform} from 'react-native';
import {Layout, Navigation, Options, OptionsModalPresentationStyle} from 'react-native-navigation';
import merge from 'deepmerge';

import {Preferences, Screens} from '@constants';
import NavigationConstants, {TabBarStacks} from '@constants/navigation';
import EphemeralStore from '@store/ephemeral_store';
import type {LaunchProps} from '@typings/launch';

function getThemeFromState() {
    if (EphemeralStore.theme) {
        return EphemeralStore.theme;
    }
    if (Appearance.getColorScheme() === 'dark') {
        return Preferences.THEMES.windows10;
    }
    return Preferences.THEMES.default;
}

export function resetToChannel(passProps = {}) {
    const theme = getThemeFromState();

    EphemeralStore.clearNavigationComponents();

    const stack = {
        children: [{
            component: {
                id: Screens.CHANNEL,
                name: Screens.CHANNEL,
                passProps,
                options: {
                    layout: {
                        componentBackgroundColor: theme.centerChannelBg,
                    },
                    statusBar: {
                        visible: true,
                    },
                    topBar: {
                        visible: false,
                        height: 0,
                        background: {
                            color: theme.sidebarHeaderBg,
                        },
                        backButton: {
                            visible: false,
                            color: theme.sidebarHeaderTextColor,
                        },
                    },
                },
            },
        }],
    };

    const platformStack: Layout = {stack};

    // if (Platform.OS === 'android') {
    //     platformStack = {
    //         sideMenu: {
    //             left: {
    //                 component: {
    //                     id: Screens.MAIN_SIDEBAR,
    //                     name: Screens.MAIN_SIDEBAR,
    //                 },
    //             },
    //             center: {
    //                 stack,
    //             },
    //             right: {
    //                 component: {
    //                     id: Screens.SETTINGS_SIDEBAR,
    //                     name: Screens.SETTINGS_SIDEBAR,
    //                 },
    //             },
    //         },
    //     };
    // }

    Navigation.setRoot({
        root: {
            ...platformStack,
        },
    });
}

export function resetToSelectServer(passProps: LaunchProps) {
    const theme = getThemeFromState();

    EphemeralStore.clearNavigationComponents();

    const children = [{
        component: {
            id: Screens.SERVER,
            name: Screens.SERVER,
            passProps: {
                ...passProps,
                theme,
            },
            options: {
                layout: {
                    backgroundColor: theme.centerChannelBg,
                    componentBackgroundColor: theme.centerChannelBg,
                },
                statusBar: {
                    visible: true,
                },
                topBar: {
                    backButton: {
                        color: theme.sidebarHeaderTextColor,
                        title: '',
                    },
                    background: {
                        color: theme.sidebarHeaderBg,
                    },
                    visible: false,
                    height: 0,
                },
            },
        },
    }];

    Navigation.setRoot({
        root: {
            stack: {
                children,
            },
        },
    });
}

export function resetToBottomTabs(passProps?: LaunchProps) {
    const theme = getThemeFromState();

    EphemeralStore.clearNavigationComponents();

    const homeStack = {
        stack: {
            id: TabBarStacks.TAB_HOME,
            children: [
                {
                    component: {
                        name: Screens.HOME,
                        id: 'HOME',
                        passProps: {
                            ...passProps,
                            theme,
                        },
                    },
                },
            ],
        },
    };

    const searchStack = {
        stack: {
            id: TabBarStacks.TAB_SEARCH,
            children: [
                {
                    component: {
                        name: Screens.SEARCH,
                        id: 'SEARCH',
                        passProps: {
                            ...passProps,
                            theme,
                        },
                    },
                },
            ],
        },
    };

    const mentionStack = {
        stack: {
            id: TabBarStacks.TAB_MENTION,
            children: [
                {
                    component: {
                        name: Screens.MENTION,
                        id: 'MENTION',
                        passProps: {
                            ...passProps,
                            theme,
                        },
                    },
                },
            ],
        },
    };

    const accountStack = {
        stack: {
            id: TabBarStacks.TAB_ACCOUNT,
            children: [
                {
                    component: {
                        name: Screens.ACCOUNT,
                        id: 'ACCOUNT',
                        passProps: {
                            ...passProps,
                            theme,
                        },
                    },
                },
            ],
        },
    };

    Navigation.setRoot({
        root: {
            bottomTabs: {
                children: [
                    homeStack,
                    searchStack,
                    mentionStack,
                    accountStack,
                ],
                options: {
                    bottomTabs: {
                        currentTabIndex: 0,
                        visible: false,
                        tabsAttachMode: 'onSwitchToTab',
                    },
                },
            },
        },
    });
}

export function resetToTeams(name: string, title: string, passProps = {}, options = {}) {
    const theme = getThemeFromState();
    const defaultOptions = {
        layout: {
            componentBackgroundColor: theme.centerChannelBg,
        },
        statusBar: {
            visible: true,
        },
        topBar: {
            visible: true,
            title: {
                color: theme.sidebarHeaderTextColor,
                text: title,
            },
            backButton: {
                color: theme.sidebarHeaderTextColor,
                title: '',
            },
            background: {
                color: theme.sidebarHeaderBg,
            },
        },
    };

    EphemeralStore.clearNavigationComponents();

    Navigation.setRoot({
        root: {
            stack: {
                children: [{
                    component: {
                        id: name,
                        name,
                        passProps,
                        options: merge(defaultOptions, options),
                    },
                }],
            },
        },
    });
}

export function goToScreen(name: string, title: string, passProps = {}, options = {}) {
    const theme = getThemeFromState();
    const componentId = EphemeralStore.getNavigationTopComponentId();
    const defaultOptions = {
        layout: {
            componentBackgroundColor: theme.centerChannelBg,
        },
        popGesture: true,
        sideMenu: {
            left: {enabled: false},
            right: {enabled: false},
        },
        topBar: {
            animate: true,
            visible: true,
            backButton: {
                color: theme.sidebarHeaderTextColor,
                title: '',
                testID: 'screen.back.button',
            },
            background: {
                color: theme.sidebarHeaderBg,
            },
            title: {
                color: theme.sidebarHeaderTextColor,
                text: title,
            },
        },
    };

    Navigation.push(componentId, {
        component: {
            id: name,
            name,
            passProps,
            options: merge(defaultOptions, options),
        },
    });
}

export function popTopScreen(screenId?: string) {
    if (screenId) {
        Navigation.pop(screenId);
    } else {
        const componentId = EphemeralStore.getNavigationTopComponentId();
        Navigation.pop(componentId);
    }
}

export async function popToRoot() {
    const componentId = EphemeralStore.getNavigationTopComponentId();

    try {
        await Navigation.popToRoot(componentId);
    } catch (error) {
        // RNN returns a promise rejection if there are no screens
        // atop the root screen to pop. We'll do nothing in this case.
    }
}

export async function dismissAllModalsAndPopToRoot() {
    await dismissAllModals();
    await popToRoot();

    DeviceEventEmitter.emit(NavigationConstants.NAVIGATION_DISMISS_AND_POP_TO_ROOT);
}

export function showModal(name: string, title: string, passProps = {}, options = {}) {
    const theme = getThemeFromState();
    const modalPresentationStyle: OptionsModalPresentationStyle = Platform.OS === 'ios' ? OptionsModalPresentationStyle.pageSheet : OptionsModalPresentationStyle.none;
    const defaultOptions: Options = {
        modalPresentationStyle,
        layout: {
            componentBackgroundColor: theme.centerChannelBg,
        },
        statusBar: {
            visible: true,
        },
        topBar: {
            animate: true,
            visible: true,
            backButton: {
                color: theme.sidebarHeaderTextColor,
                title: '',
            },
            background: {
                color: theme.sidebarHeaderBg,
            },
            title: {
                color: theme.sidebarHeaderTextColor,
                text: title,
            },
            leftButtonColor: theme.sidebarHeaderTextColor,
            rightButtonColor: theme.sidebarHeaderTextColor,
        },
    };

    EphemeralStore.addNavigationModal(name);
    Navigation.showModal({
        stack: {
            children: [{
                component: {
                    id: name,
                    name,
                    passProps,
                    options: merge(defaultOptions, options),
                },
            }],
        },
    });
}

export function showModalOverCurrentContext(name: string, passProps = {}, options = {}) {
    const title = '';
    let animations;
    switch (Platform.OS) {
        case 'android':
            animations = {
                showModal: {
                    waitForRender: true,
                    alpha: {
                        from: 0,
                        to: 1,
                        duration: 250,
                    },
                },
                dismissModal: {
                    alpha: {
                        from: 1,
                        to: 0,
                        duration: 250,
                    },
                },
            };
            break;
        default:
            animations = {
                showModal: {
                    enter: {
                        enabled: false,
                    },
                    exit: {
                        enabled: false,
                    },
                },
                dismissModal: {
                    enter: {
                        enabled: false,
                    },
                    exit: {
                        enabled: false,
                    },
                },
            };
            break;
    }
    const defaultOptions = {
        modalPresentationStyle: 'overCurrentContext',
        layout: {
            backgroundColor: 'transparent',
            componentBackgroundColor: 'transparent',
        },
        topBar: {
            visible: false,
            height: 0,
        },
        animations,
    };
    const mergeOptions = merge(defaultOptions, options);
    showModal(name, title, passProps, mergeOptions);
}

export function showSearchModal(initialValue = '') {
    const name = 'Search';
    const title = '';
    const passProps = {initialValue};
    const options = {
        topBar: {
            visible: false,
            height: 0,
        },
        ...Platform.select({
            ios: {
                modalPresentationStyle: 'pageSheet',
            },
        }),
    };

    showModal(name, title, passProps, options);
}

export async function dismissModal(options = {}) {
    if (!EphemeralStore.hasModalsOpened()) {
        return;
    }

    const componentId = EphemeralStore.getNavigationTopComponentId();

    try {
        await Navigation.dismissModal(componentId, options);
        EphemeralStore.removeNavigationModal(componentId);
    } catch (error) {
        // RNN returns a promise rejection if there is no modal to
        // dismiss. We'll do nothing in this case.
    }
}

export async function dismissAllModals(options = {}) {
    if (!EphemeralStore.hasModalsOpened()) {
        return;
    }

    try {
        await Navigation.dismissAllModals(options);
        EphemeralStore.clearNavigationModals();
    } catch (error) {
        // RNN returns a promise rejection if there are no modals to
        // dismiss. We'll do nothing in this case.
    }
}

export function setButtons(componentId: string, buttons = {leftButtons: [], rightButtons: []}) {
    const options = {
        topBar: {
            ...buttons,
        },
    };

    mergeNavigationOptions(componentId, options);
}

export function mergeNavigationOptions(componentId: string, options: Options) {
    Navigation.mergeOptions(componentId, options);
}

export function showOverlay(name: string, passProps = {}, options = {}) {
    const defaultOptions = {
        layout: {
            backgroundColor: 'transparent',
            componentBackgroundColor: 'transparent',
        },
        overlay: {
            interceptTouchOutside: false,
        },
    };

    Navigation.showOverlay({
        component: {
            name,
            passProps,
            options: merge(defaultOptions, options),
        },
    });
}

export async function dismissOverlay(componentId: string) {
    try {
        await Navigation.dismissOverlay(componentId);
    } catch (error) {
        // RNN returns a promise rejection if there is no modal with
        // this componentId to dismiss. We'll do nothing in this case.
    }
}

export function openMainSideMenu() {
    if (Platform.OS === 'ios') {
        return;
    }

    const componentId = EphemeralStore.getNavigationTopComponentId();

    Keyboard.dismiss();
    Navigation.mergeOptions(componentId, {
        sideMenu: {
            left: {visible: true},
        },
    });
}

export function closeMainSideMenu() {
    if (Platform.OS === 'ios') {
        return;
    }

    Keyboard.dismiss();
    Navigation.mergeOptions(Screens.CHANNEL, {
        sideMenu: {
            left: {visible: false},
        },
    });
}

export function enableMainSideMenu(enabled: boolean, visible = true) {
    if (Platform.OS === 'ios') {
        return;
    }

    Navigation.mergeOptions(Screens.CHANNEL, {
        sideMenu: {
            left: {enabled, visible},
        },
    });
}

export function openSettingsSideMenu() {
    if (Platform.OS === 'ios') {
        return;
    }

    Keyboard.dismiss();
    Navigation.mergeOptions(Screens.CHANNEL, {
        sideMenu: {
            right: {visible: true},
        },
    });
}

export function closeSettingsSideMenu() {
    if (Platform.OS === 'ios') {
        return;
    }

    Keyboard.dismiss();
    Navigation.mergeOptions(Screens.CHANNEL, {
        sideMenu: {
            right: {visible: false},
        },
    });
}
