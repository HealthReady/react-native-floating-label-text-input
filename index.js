'use strict';

import React, {PropTypes} from 'react';
import {StyleSheet, Text, View, TextInput, Animated, Platform} from 'react-native';
const ANDROID_PLATFORM = (Platform.OS === 'android');

var FloatingLabel = React.createClass({
    getInitialState: function () {
        var initialPadding = 9;
        var initialOpacity = 0;

        if (this.props.visible) {
            initialPadding = 5
            initialOpacity = 1
        }

        return {
            paddingAnim: new Animated.Value(initialPadding),
            opacityAnim: new Animated.Value(initialOpacity)
        };
    },

    componentWillReceiveProps: function (newProps) {
        Animated.timing(this.state.paddingAnim, {
            toValue: newProps.visible ? 5 : 9,
            duration: 230
        }).start();

        return Animated.timing(this.state.opacityAnim, {
            toValue: newProps.visible ? 1 : 0,
            duration: 230
        }).start();
    },

    render: function () {
        return (
            <Animated.View
                style={[styles.floatingLabel, {paddingTop: this.state.paddingAnim, opacity: this.state.opacityAnim}]}>
                {this.props.children}
            </Animated.View>
        );
    }
});

var TextFieldHolder = React.createClass({
    getInitialState: function () {
        return {
            marginAnim: new Animated.Value(this.props.withValue ? 10 : 0)
        };
    },

    componentWillReceiveProps: function (newProps) {
        return Animated.timing(this.state.marginAnim, {
            toValue: newProps.withValue ? 10 : 0,
            duration: 230
        }).start();
    },

    render: function () {
        return (
            <Animated.View style={[{marginTop: this.state.marginAnim}, this.props.style]}>
                {this.props.children}
            </Animated.View>
        );
    }
});

var FloatLabelTextField = React.createClass({
    propTypes: {
        autoGrowing: PropTypes.bool,
        containerHeightOffset: PropTypes.number,
        initialHeight: PropTypes.number,
        minHeight: PropTypes.number,
        maxHeight: PropTypes.number
    },

    getDefaultProps: function() {
        return {
            autoGrowing: false,
            containerHeightOffset: 8,
            initialHeight: 37,
            minHeight: 37,
            maxHeight: 300
        };
    },

    getInitialState: function () {
        if (this.props.defaultValue && this.props.defaultValue.length > 0) {
            return {
                focussed: this.props.autoFocus ? this.props.autoFocus : false,
                height: this._getValidHeight(this.props.initialHeight),
                androidFirstContentSizeChange: true,
                text: this.props.defaultValue,
            };
        }
        return {
            focussed: false,
            height: this._getValidHeight(this.props.initialHeight),
            androidFirstContentSizeChange: true,
            text: this.props.value
        };
    },

    componentWillReceiveProps: function (newProps) {
        if (newProps.hasOwnProperty('value') && newProps.value !== this.state.text) {
            this.setState({text: newProps.value})
        }
    },

    withBorder: function () {
        if (!this.props.noBorder) {
            return [styles.withBorder, this.props.borderStyle];
        }
    },

    focus: function () {
        this.refs.innerInput.focus();
    },
    blur: function () {
        this.refs.innerInput.blur();
    },
    isFocused: function () {
        return this.refs.innerInput.isFocused();
    },
    clear: function () {
        this.setState({text: ''});
    },

    _onContentSizeChange: function(event) {
        if(ANDROID_PLATFORM) {
            if(!this.state.androidFirstContentSizeChange) {
                return;
            }
            this.setState({androidFirstContentSizeChange: false});
        }
        this._handleNativeEvent(event.nativeEvent);

        if (this.props.onContentSizeChange) {
            this.props.onContentSizeChange(event);
        }
    },

    _getValidHeight: function(height) {
        const minCappedHeight = Math.max(this.props.minHeight, height);
        if(this.props.maxHeight == null) {
            return minCappedHeight;
        }
        return Math.min(this.props.maxHeight, minCappedHeight);
    },

    _onChange: function(event) {
        if(ANDROID_PLATFORM && !this.state.androidFirstContentSizeChange) {
            this._handleNativeEvent(event.nativeEvent);
        }
        if (this.props.onChange) {
            this.props.onChange(event);
        }
    },

    _handleNativeEvent: function(nativeEvent) {
        let newHeight = this.state.height;
        if (nativeEvent.contentSize && this.props.autoGrowing) {
            newHeight = nativeEvent.contentSize.height;
            if (this.state.height !== newHeight && newHeight <= this.props.maxHeight && this.props.onHeightChanged) {
                this.props.onHeightChanged(newHeight, this.state.height, newHeight - this.state.height);
            }
        }

        // if (this.props.animation.animated) {
        //     const duration = this.props.animation.duration || DEFAULT_ANIM_DURATION;
        //     LayoutAnimation.configureNext({...LayoutAnimation.Presets.easeInEaseOut, duration: duration});
        // }

        this.setState({
            height: newHeight
        });
    },

    render: function () {
        return (
            <View>
                <View style={[styles.container, this.props.backgroundStyle, this.props.autoGrowing && {height: this._getValidHeight(this.state.height) + this.props.containerHeightOffset}]}>
                    <View style={styles.viewContainer}>
                        {this.props.hasPadding ? <View style={styles.paddingView}></View> : null}
                        <View style={[styles.fieldContainer, this.withBorder()]}>
                            <FloatingLabel visible={this.state.text}>
                                <Text style={[styles.fieldLabel, this.labelStyle()]}>{this.placeholderValue()}</Text>
                            </FloatingLabel>
                            <TextFieldHolder withValue={this.state.text} style={this.props.inputHolderStyle}>
                                <TextInput
                                    ref="innerInput"
                                    placeholder={this.props.placeholder}
                                    placeholderTextColor={this.props.placeholderTextColor}
                                    style={[styles.valueText, this.props.style, this.props.autoGrowing && {height: this._getValidHeight(this.state.height)}]}
                                    defaultValue={this.props.defaultValue}
                                    value={this.state.text}
                                    maxLength={this.props.maxLength}
                                    selectionColor={this.props.selectionColor}
                                    onFocus={this.setFocus}
                                    onBlur={this.unsetFocus}
                                    onChange={this._onChange}
                                    onChangeText={this.setText}
                                    secureTextEntry={this.props.secureTextEntry}
                                    keyboardType={this.props.keyboardType}
                                    autoCapitalize={this.props.autoCapitalize}
                                    autoCorrect={this.props.autoCorrect}
                                    autoFocus={this.props.autoFocus}
                                    clearTextOnFocus={this.props.clearTextOnFocus}
                                    blurOnSubmit={this.props.blurOnSubmit}
                                    onSubmitEditing={this.props.onSubmitEditing}
                                    onEndEditing={this.props.onEndEditing}
                                    returnKeyType={this.props.returnKeyType}
                                    onKeyPress={this.props.onKeyPress}
                                    onContentSizeChange={this._onContentSizeChange}
                                    multiline={this.props.multiline}
                                    underlineColorAndroid={this.props.underlineColorAndroid ? this.props.underlineColorAndroid : 'transparent'}
                                />
                            </TextFieldHolder>
                        </View>
                    </View>
                </View>
                {this.props.children}
            </View>
        );
    },
    setFocus: function () {
        this.setState({
            focussed: true
        });
        try {
            return this.props.onFocus();
        } catch (_error) {
        }
    },

    unsetFocus: function () {
        this.setState({
            focussed: false
        });
        try {
            return this.props.onBlur();
        } catch (_error) {
        }
    },

    labelStyle: function () {
        if (this.state.focussed) {
            return [styles.fieldLabel, styles.focussed, this.props.focusLabelStyle];
        }
        return [styles.fieldLabel, this.props.labelStyle];
    },

    placeholderValue: function () {
        if (this.state.text) {
            return this.props.placeholder;
        }
    },

    setText: function (value) {
        this.setState({
            text: value
        });
        try {
            return this.props.onChangeText(value);
        } catch (_error) {
        }
    },

    withMargin: function () {
        if (this.state.text) {
            return styles.withMargin;
        }
    }
});

var styles = StyleSheet.create({
    container: {
        flex: 1,
        height: 45,
        backgroundColor: 'white',
        justifyContent: 'center'
    },
    viewContainer: {
        flex: 1,
        flexDirection: 'row'
    },
    paddingView: {
        width: 15
    },
    floatingLabel: {
        position: 'absolute',
        top: 0,
        left: 0
    },
    fieldLabel: {
    height: 15,
    fontSize: 10,
        color: '#B1B1B1'
    },
    fieldContainer: {
        flex: 1,
        justifyContent: 'center',
        position: 'relative'
    },
    withBorder: {
        borderBottomWidth: 1 / 2,
        borderColor: '#C8C7CC',
        backgroundColor: 'transparent'
    },
    valueText: {
        height: Platform.OS == 'ios' ? 20 : 40,
        fontSize: 16,
        marginLeft: Platform.OS == 'android' ? -4 : 0,
        color: '#111111'
    },
    withMargin: {
        marginTop: 10
    },
    focussed: {
        color: "#1482fe"
    }
});

module.exports = FloatLabelTextField
