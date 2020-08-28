/*
 * Copyright (c) Minh Loi.
 *
 * This file is part of Ulangi which is released under GPL v3.0.
 * See LICENSE or go to https://www.gnu.org/licenses/gpl-3.0.txt
 */

import { Options } from '@ulangi/react-native-navigation';
import { ScreenName, Theme } from '@ulangi/ulangi-common/enums';
import {
  ObservableSpacedRepetitionScreen,
  ObservableTopBarButton,
  ObservableTouchableTopBar,
} from '@ulangi/ulangi-observable';
import { observer } from 'mobx-react';
import * as React from 'react';

import { Container, ContainerPassedProps } from '../../Container';
import { Images } from '../../constants/Images';
import { SpacedRepetitionScreenIds } from '../../constants/ids/SpacedRepetitionScreenIds';
import { SpacedRepetitionScreenFactory } from '../../factories/spaced-repetition/SpacedRepetitionScreenFactory';
import { SpacedRepetitionScreen } from '../../views/spaced-repetition/SpacedRepetitionScreen';
import { SpacedRepetitionScreenStyle } from '../../views/spaced-repetition/SpacedRepetitionScreenContainer.style';

export interface SpacedRepetitionScreenPassedProps {
  selectedCategoryNames: undefined | string[];
  onClose?: () => void;
}

@observer
export class SpacedRepetitionScreenContainer extends Container<
  SpacedRepetitionScreenPassedProps
> {
  public static options(props: ContainerPassedProps): Options {
    return props.theme === Theme.LIGHT
      ? SpacedRepetitionScreenStyle.SCREEN_FULL_LIGHT_STYLES
      : SpacedRepetitionScreenStyle.SCREEN_FULL_DARK_STYLES;
  }

  private screenFactory = new SpacedRepetitionScreenFactory(
    this.props,
    this.eventBus,
    this.observer,
  );

  private setSelectionMenuDelegate = this.screenFactory.createSetSelectionMenuDelegateWithStyles();

  protected observableScreen = new ObservableSpacedRepetitionScreen(
    this.props.passedProps.selectedCategoryNames,
    this.props.componentId,
    ScreenName.SPACED_REPETITION_SCREEN,
    new ObservableTouchableTopBar(
      SpacedRepetitionScreenIds.SHOW_SET_SELECTION_MENU_BTN,
      this.setSelectionMenuDelegate.getCurrentSetName(),
      this.setSelectionMenuDelegate.getCurrentFlagIcon(),
      (): void => {
        this.setSelectionMenuDelegate.showActiveSetsForSetSelection();
      },
      new ObservableTopBarButton(
        SpacedRepetitionScreenIds.BACK_BTN,
        null,
        {
          light: Images.ARROW_LEFT_BLACK_22X22,
          dark: Images.ARROW_LEFT_MILK_22X22,
        },
        (): void => {
          this.navigatorDelegate.dismissScreen();
        },
      ),
      null,
    ),
  );

  private navigatorDelegate = this.screenFactory.createNavigatorDelegate();

  private screenDelegate = this.screenFactory.createScreenDelegate(
    this.observableScreen,
  );

  protected onThemeChanged(theme: Theme): void {
    this.navigatorDelegate.mergeOptions(
      theme === Theme.LIGHT
        ? SpacedRepetitionScreenStyle.SCREEN_LIGHT_STYLES_ONLY
        : SpacedRepetitionScreenStyle.SCREEN_DARK_STYLES_ONLY,
    );
  }

  public componentDidMount(): void {
    this.setSelectionMenuDelegate.autoUpdateSubtitleOnSetChange(
      this.observableScreen,
    );
  }

  public componentDidAppear(): void {
    this.screenDelegate.refreshDueAndNewCounts();
  }

  public componentWillUnmount(): void {
    this.screenDelegate.clearDueAndNewCounts();

    if (typeof this.props.passedProps.onClose !== 'undefined') {
      this.props.passedProps.onClose();
    }
  }

  public render(): React.ReactElement<any> {
    return (
      <SpacedRepetitionScreen
        themeStore={this.props.rootStore.themeStore}
        observableScreen={this.observableScreen}
        screenDelegate={this.screenDelegate}
      />
    );
  }
}
