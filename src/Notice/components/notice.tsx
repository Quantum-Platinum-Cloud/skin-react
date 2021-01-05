/*
 * ************************************************************
 *  Copyright 2020 eBay Inc.
 *  Author/Developer: Arturo Montoya
 *  Use of this source code is governed by an MIT-style
 *  license that can be found in the LICENSE file or at
 *  https://opensource.org/licenses/MIT.
 *  ***********************************************************
 */

import * as React from 'react';
import classNames from 'classnames';
import * as Skin from '../../skin';
import Icon, {IconName} from '../../Icon';

export type NoticeVariant = 'confirmation' | 'attention' | 'information' | 'celebration';
export type NoticeType = 'page' | 'section' | 'inline';
export const getClass = (type: NoticeType) => {
  const preFix = `${type || 'page'}-notice`;
  return (postFix: string = '') => `${preFix}${postFix}`;
};
const SectionRows = ({type, ...props}) => React.createElement(type === 'inline' ? 'span' : 'div', props);

export interface NoticeProps<T> extends Skin.Role, Omit<React.HTMLProps<T>, 'content'> {
  title?: string;
  iconName?: IconName;
  iconProps?: object;
  variant?: NoticeVariant;
  type?: NoticeType;
  content?: React.ReactNode;
  a11yText?: string;
}
export const BasicNotice = ({
  content,
  children,
  variant,
  type,
  iconName,
  iconProps = {},
  title,
  id,
  a11yText,
  role = 'region',
  ...props
}: NoticeProps<HTMLElement>) => {
  const getVariantClass = getClass(type);
  const className = classNames(
    getVariantClass(),
    {
      [getVariantClass(`--${variant}`)]: variant
    },
    props.className
  );

  const Section = (props) => React.createElement(type === 'inline' ? 'div' : 'section', props);
  const HTMLProps = {...props, className, role};
  return (
    <Section aria-label={a11yText || variant} {...HTMLProps}>
      <NoticeStatus type={type} variant={variant} iconName={iconName} iconProps={iconProps} a11yText={a11yText} />
      {(content || title) && (
        <NoticeContent type={type} title={title}>
          {content}
        </NoticeContent>
      )}
      {type !== 'inline' ? (
        <SectionRows type={type} className={getVariantClass(`__footer`)}>
          {children}
        </SectionRows>
      ) : (
        children
      )}
    </Section>
  );
};

interface NoticeStatusProps<T> extends Skin.Role, React.HTMLProps<T> {
  iconName?: IconName;
  iconProps?: any;
  variant?: NoticeVariant;
  type?: NoticeType;
  a11yText?: string;
}
export const NoticeStatus = ({
  iconName,
  type,
  variant,
  iconProps = {},
  a11yText,
  ...props
}: NoticeStatusProps<HTMLSpanElement>) => {
  const getVariantClass = getClass(type);
  return (
    <SectionRows type={type} {...props} className={classNames(getVariantClass('__header'), props.className)}>
      {props.children}
      <Icon name={iconName ? iconName : `${variant}-filled`} {...iconProps} aria-label={a11yText || variant} />
    </SectionRows>
  );
};

interface NoticeContentProps<T> extends Skin.Role, React.HTMLProps<T> {
  title?: string;
  type?: NoticeType;
}
export const NoticeContent = ({title, type, ...props}: NoticeContentProps<HTMLSpanElement>) => {
  const getVariantClass = getClass(type);
  return (
    <SectionRows type={type} {...props} className={classNames(getVariantClass('__main'), props.className)}>
      {title && type !== 'inline' && (
        <p>
          <span className={getVariantClass('__title')}>{title}</span>
        </p>
      )}
      {props.children}
    </SectionRows>
  );
};

export default BasicNotice;
