// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React, {PureComponent} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import CompassIcon from '@components/compass_icon';
import FormattedText from '@components/formatted_text';
import {preventDoubleTap} from '@utils/tap';

export default class OptionsModalList extends PureComponent {
    static propTypes = {
        items: PropTypes.array.isRequired,
        onCancelPress: PropTypes.func,
        onItemPress: PropTypes.func,
        title: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.object,
        ]),
    };

    static defaultProps = {
        items: [],
    };

    handleCancelPress = preventDoubleTap(() => {
        if (this.props.onCancelPress) {
            this.props.onCancelPress();
        }
    });

    handleItemPress = preventDoubleTap((action) => {
        this.props.onItemPress();
        setTimeout(() => {
            if (typeof action === 'function') {
                action();
            }
        }, 100);
    });

    renderOptions = () => {
        const {items} = this.props;

        const options = items.map((item, index) => {
            let textComponent;
            let optionIconStyle = style.optionIcon;
            if (typeof item.iconStyle !== 'undefined') {
                optionIconStyle = item.iconStyle;
            }

            if (item.text.hasOwnProperty('id')) {
                textComponent = (
                    <FormattedText
                        style={[style.optionText, item.textStyle, (!item.icon && {textAlign: 'left'})]}
                        {...item.text}
                    />
                );
            } else {
                textComponent = <Text style={[style.optionText, item.textStyle, (!item.icon && {textAlign: 'left'})]}>{item.text}</Text>;
            }

            return (
                <View key={index}>
                    <TouchableOpacity
                        onPress={() => this.handleItemPress(item.action)}
                        style={style.option}
                    >
                        {item.icon &&
                        <CompassIcon
                            name={item.icon}
                            size={24}
                            style={optionIconStyle}
                        />
                        }
                        {textComponent}

                    </TouchableOpacity>
                </View>
            );
        });

        let title;
        let titleComponent;
        if (this.props.title) {
            if (this.props.title.hasOwnProperty('id')) {
                titleComponent = (
                    <FormattedText
                        style={style.optionTitleText}
                        {...this.props.title}
                    />
                );
            } else {
                titleComponent = <Text style={style.optionTitleText}>{this.props.title}</Text>;
            }

            title = (
                <View
                    key={items.length}
                    style={[style.option]}
                >
                    {titleComponent}
                </View>
            );
        }

        return [
            title,
            ...options,
        ];
    };

    render() {
        return (
            <View style={style.container}>
                <View style={style.wrapper}>
                    <View style={[style.optionContainer]}>
                        {this.renderOptions()}
                    </View>
                </View>
            </View>
        );
    }
}

const style = StyleSheet.create({
    option: {
        alignSelf: 'stretch',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        width: '100%',
    },
    optionContainer: {
        alignSelf: 'stretch',
        backgroundColor: 'white',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        paddingVertical: 10,
        ...Platform.select({
            ios: {
                paddingBottom: 25,
            },
            android: {
                marginBottom: -10,
            },
        }),

    },
    optionIcon: {
        color: 'rgba(61, 60, 64, 0.64)',
        paddingRight: 10,
    },
    optionText: {
        color: '#3D3C40',
        flex: 1,
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '400',
    },
    optionTitleText: {
        fontSize: 24,
        lineHeight: 32,
        fontWeight: '600',
        color: '#3D3C40',
        flex: 1,
        textAlign: 'left',
        paddingVertical: 10,
    },
    optionSubTitleText: {
        fontSize: 16,
        lineHeight: 24,
        color: 'rgba(61, 60, 64, 0.64)',
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    wrapper: {
        maxWidth: 450,
        width: '100%',
    },
});
