// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import CompassIcon from '@components/compass_icon';
import FormattedText from '@components/formatted_text';
import TouchableWithFeedback from '@components/touchable_with_feedback';
import {t} from '@utils/i18n';
import {changeOpacity, makeStyleSheetFromTheme} from '@utils/theme';

export default class ShowMoreButton extends PureComponent {
    static propTypes = {
        highlight: PropTypes.bool,
        onPress: PropTypes.func.isRequired,
        showMore: PropTypes.bool.isRequired,
        theme: PropTypes.object.isRequired,
    };

    static defaultProps = {
        showMore: true,
    };

    renderButton(showMore, style) {
        let textId = t('post_info.message.show_more');
        let textMessage = 'Show More';
        let iconName = 'plus';
        if (!showMore) {
            textId = t('post_info.message.show_less');
            textMessage = 'Show Less';
            iconName = 'minus';
        }

        return (
            <View
                style={style.button}
                testID={`show_more.button.${iconName}`}
            >
                <CompassIcon
                    name={iconName}
                    size={18}
                    style={style.sign}
                />
                <FormattedText
                    id={textId}
                    defaultMessage={textMessage}
                    style={style.text}
                />
            </View>
        );
    }

    render() {
        const {highlight, showMore, theme} = this.props;
        const style = getStyleSheet(theme, showMore);

        let gradientColors = [
            changeOpacity(theme.centerChannelBg, 0),
            changeOpacity(theme.centerChannelBg, 0.75),
            theme.centerChannelBg,
        ];
        if (highlight) {
            gradientColors = [
                changeOpacity(theme.mentionHighlightBg, 0),
                changeOpacity(theme.mentionHighlightBg, 0.15),
                changeOpacity(theme.mentionHighlightBg, 0.5),
            ];
        }

        return (
            <View>
                {showMore &&
                <LinearGradient
                    colors={gradientColors}
                    locations={[0, 0.7, 1]}
                    style={style.gradient}
                />
                }
                <View style={style.container}>
                    <View style={style.dividerLeft}/>
                    <TouchableWithFeedback
                        onPress={this.props.onPress}
                        style={style.buttonContainer}
                        type={'opacity'}
                    >
                        {this.renderButton(showMore, style)}
                    </TouchableWithFeedback>
                    <View style={style.dividerRight}/>
                </View>
            </View>
        );
    }
}

const getStyleSheet = makeStyleSheetFromTheme((theme, showMore) => {
    return {
        gradient: {
            flex: 1,
            height: 50,
            position: 'absolute',
            top: -50,
            width: '100%',
        },
        container: {
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            flexDirection: 'row',
            position: 'relative',
            top: showMore ? -7.5 : 10,
            marginBottom: 10,
        },
        dividerLeft: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.2),
            flex: 1,
            height: 1,
            marginRight: 10,
        },
        buttonContainer: {
            backgroundColor: theme.centerChannelBg,
            borderColor: changeOpacity(theme.centerChannelColor, 0.2),
            borderRadius: 4,
            borderWidth: 1,
            height: 37,
            paddingHorizontal: 10,
        },
        button: {
            alignItems: 'center',
            flex: 1,
            flexDirection: 'row',
        },
        sign: {
            color: theme.linkColor,
            marginRight: 7,
        },
        text: {
            color: theme.linkColor,
            fontSize: 15,
            fontWeight: '600',
        },
        dividerRight: {
            backgroundColor: changeOpacity(theme.centerChannelColor, 0.2),
            flex: 1,
            height: 1,
            marginLeft: 10,
        },
    };
});
