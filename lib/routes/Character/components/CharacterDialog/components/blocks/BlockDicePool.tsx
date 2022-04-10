import { css, cx } from "@emotion/css";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import FastForwardIcon from "@mui/icons-material/FastForward";
import FastRewindIcon from "@mui/icons-material/FastRewind";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import Badge from "@mui/material/Badge";
import Box, { BoxProps } from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import { darken, lighten, useTheme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import { default as React, useContext, useEffect, useState } from "react";
import { ContentEditable } from "../../../../../../components/ContentEditable/ContentEditable";
import { Delays } from "../../../../../../constants/Delays";
import { DiceContext } from "../../../../../../contexts/DiceContext/DiceContext";
import {
  BlockType,
  IDicePoolBlock,
  ISkillBlock,
} from "../../../../../../domains/character/types";
import {
  IDiceCommandSetId,
  IRollGroup,
} from "../../../../../../domains/dice/Dice";
import { Icons } from "../../../../../../domains/Icons/Icons";
import { useTranslate } from "../../../../../../hooks/useTranslate/useTranslate";
import { BlockSelectors } from "../../domains/BlockSelectors/BlockSelectors";
import { DiceCommandGroup } from "../../domains/DiceCommandGroup/DiceCommandGroup";
import {
  IBlockActionComponentProps,
  IBlockComponentProps,
} from "../../types/IBlockComponentProps";
import { BlockToggleMeta } from "../BlockToggleMeta";
import { DiceMenuForCharacterSheet } from "../DiceMenuForCharacterSheet";
import { ThemedLabel } from "../ThemedLabel";

export type IDicePoolElement = {
  blockId: string;
  blockType: BlockType;
  label: string;
  rollGroup: IRollGroup;
};

export type IDicePool = Array<IDicePoolElement>;
const DiceCommandRange: Array<IDiceCommandSetId> = [
  "1d4",
  "1d6",
  "1d8",
  "1d10",
  "1d12",
  "1d20",
  "1d100",
];
export function BlockDicePool(
  props: IBlockComponentProps<IDicePoolBlock | ISkillBlock> & {
    listResults?: boolean;
    mid?: React.ReactNode;
  }
) {
  const listResults = props.listResults ?? true;
  const { t } = useTranslate();
  const theme = useTheme();
  const diceManager = useContext(DiceContext);
  const [hover, setHover] = useState(false);
  const [hoverControlsVisible, setHoverControlsVisible] = useState(false);
  const hasCommands = !!props.block.meta.commands?.length;
  const canRoll = !props.readonly;
  const isSelected = diceManager.state.pool.some(
    (p) => p.blockId === props.block.id
  );
  const isToggleVisible =
    props.block.meta?.checked === true || props.block.meta?.checked === false;

  const commands = props.block.meta.commands || [];
  const commandsCount = commands.reduce((acc, curr) => {
    return {
      ...acc,
      [curr]: acc[curr] ? acc[curr] + 1 : 1,
    };
  }, {} as Record<IDiceCommandSetId, number>);

  const firstCommand = commands[0];
  const isAllTheSameCommand =
    !!firstCommand && commands.every((c) => c === firstCommand);
  const canChangeDiceSize =
    isAllTheSameCommand && DiceCommandRange.includes(firstCommand);

  useEffect(() => {
    let enterTimeout: NodeJS.Timeout;
    let leaveTimeout: NodeJS.Timeout;
    if (hover) {
      enterTimeout = setTimeout(() => {
        setHoverControlsVisible(true);
      }, Delays.blockHoverEnterControls);
    } else {
      leaveTimeout = setTimeout(() => {
        setHoverControlsVisible(false);
      }, Delays.blockHoverLeaveControls);
    }
    return () => {
      clearTimeout(enterTimeout);
      clearTimeout(leaveTimeout);
    };
  }, [hover]);

  function handleOnAddDiceFrom() {
    props.onMetaChange({
      ...props.block.meta,
      commands: [...commands, firstCommand],
    });
  }

  function handleOnRemoveDiceFrom() {
    props.onMetaChange({
      ...props.block.meta,
      commands: commands.slice(1),
    });
  }

  function handleStepDownDice() {
    const newCommands = commands.map((c) => {
      const currentDieSize = DiceCommandRange.indexOf(c);
      const newDieSizeIndex = Math.max(0, currentDieSize - 1);
      return DiceCommandRange[newDieSizeIndex];
    });
    props.onMetaChange({
      ...props.block.meta,
      commands: newCommands,
    });
  }

  function handleStepUpDice() {
    const newCommands = commands.map((c) => {
      const currentDieSize = DiceCommandRange.indexOf(c);
      const newDieSizeIndex = Math.min(
        DiceCommandRange.length - 1,
        currentDieSize + 1
      );
      return DiceCommandRange[newDieSizeIndex];
    });
    props.onMetaChange({
      ...props.block.meta,
      commands: newCommands,
    });
  }

  return (
    <>
      <Box
        onPointerEnter={() => {
          setHover(true);
        }}
        onPointerLeave={() => {
          setHover(false);
        }}
      >
        <Grid
          container
          spacing={1}
          justifyContent="center"
          alignItems="center"
          wrap="nowrap"
        >
          <Grid
            item
            className={css({
              maxWidth: "50%",
            })}
          >
            {renderPool()}
          </Grid>
          {props.mid && <Grid item>{props.mid}</Grid>}

          <Grid item xs>
            {renderLabel()}
          </Grid>
          {isToggleVisible && <Grid item>{renderToggle()}</Grid>}
        </Grid>

        {!props.readonly && (
          <Collapse in={hoverControlsVisible || props.advanced}>
            <Box py=".5rem">
              <Grid container alignItems="center">
                {canChangeDiceSize && (
                  <Grid item>
                    <Tooltip title={t("character-dialog.control.step-down")}>
                      <span>
                        <IconButton
                          size="small"
                          disabled={firstCommand === DiceCommandRange[0]}
                          color="inherit"
                          data-cy={`${props.dataCy}.step-down`}
                          onClick={() => {
                            handleStepDownDice();
                          }}
                        >
                          <FastRewindIcon
                            className={css({
                              width: "1.1rem",
                              height: "1.1rem",
                            })}
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                )}
                {isAllTheSameCommand && (
                  <Grid item>
                    <Tooltip title={t("character-dialog.control.remove-one")}>
                      <span>
                        <IconButton
                          size="small"
                          color="inherit"
                          disabled={commands.length === 1}
                          data-cy={`${props.dataCy}.remove-one`}
                          onClick={() => {
                            handleOnRemoveDiceFrom();
                          }}
                        >
                          <RemoveCircleOutlineIcon
                            className={css({
                              width: "1.1rem",
                              height: "1.1rem",
                            })}
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                )}
                <Grid item>{renderSetDice()}</Grid>
                {isAllTheSameCommand && (
                  <Grid item>
                    <Tooltip title={t("character-dialog.control.add-one")}>
                      <span>
                        <IconButton
                          color="inherit"
                          data-cy={`${props.dataCy}.add-one`}
                          size="small"
                          onClick={() => {
                            handleOnAddDiceFrom();
                          }}
                        >
                          <AddCircleOutlineIcon
                            className={css({
                              width: "1.1rem",
                              height: "1.1rem",
                            })}
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                )}
                {canChangeDiceSize && (
                  <Grid item>
                    <Tooltip title={t("character-dialog.control.step-up")}>
                      <span>
                        <IconButton
                          size="small"
                          color="inherit"
                          disabled={
                            firstCommand ===
                            DiceCommandRange[DiceCommandRange.length - 1]
                          }
                          data-cy={`${props.dataCy}.step-up`}
                          onClick={() => {
                            handleStepUpDice();
                          }}
                        >
                          <FastForwardIcon
                            className={css({
                              width: "1.1rem",
                              height: "1.1rem",
                            })}
                          />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </Grid>
                )}
              </Grid>
            </Box>
          </Collapse>
        )}
      </Box>
    </>
  );

  function renderSetDice() {
    return (
      <DiceMenuForCharacterSheet
        commandSetIds={commands}
        onChange={(newCommandIds) => {
          props.onMetaChange({
            ...props.block.meta,
            commands: newCommandIds,
          });
        }}
        render={(diceMenuProps) => (
          <Link
            component="button"
            variant="caption"
            className={css({
              color: theme.palette.primary.main,
            })}
            onClick={(e: any) => {
              if (!props.readonly) {
                diceMenuProps.openMenu(e);
              }

              if (!diceMenuProps.open) {
                diceMenuProps.openMenu(e);
              } else {
                diceMenuProps.closeMenu();
              }
            }}
            underline="hover"
          >
            {t("character-dialog.control.set-dice")}
          </Link>
        )}
      />
    );
  }

  function renderToggle() {
    return (
      <BlockToggleMeta
        readonly={props.readonly}
        dataCy={props.dataCy}
        block={props.block}
        onMetaChange={props.onMetaChange}
      />
    );
  }

  function renderLabel() {
    return (
      <ThemedLabel>
        <ContentEditable
          readonly={props.readonly || !props.advanced}
          border={props.advanced}
          data-cy={`${props.dataCy}.label`}
          value={props.block.label || ""}
          onChange={(value) => {
            props.onLabelChange(value);
          }}
        />
      </ThemedLabel>
    );
  }

  function renderPool() {
    return (
      <Pool
        fontSize="1.2rem"
        borderRadius="8px"
        selected={isSelected}
        position="relative"
        clickable={canRoll}
        tooltipTitle={
          canRoll ? t("character-dialog.helper-text.pool") : undefined
        }
        borderStyle={hasCommands ? "solid" : "dashed"}
        onContextMenu={(e) => {
          e.preventDefault();
          const rollGroup = BlockSelectors.getRollGroupFromBlock(props.block);

          diceManager.actions.setOptions({ listResults: listResults });
          diceManager.actions.addOrRemovePoolElement({
            blockId: props.block.id,
            blockType: props.block.type,
            label: props.block.label || "",
            rollGroup: rollGroup,
          });
        }}
        onClick={() => {
          if (!canRoll) {
            return;
          }
          const rollGroup = BlockSelectors.getRollGroupFromBlock(props.block);
          const diceRollResult = diceManager.actions.roll([rollGroup], {
            listResults: listResults,
          });

          props.onRoll(diceRollResult);
        }}
      >
        <Grid container spacing={1} alignItems="center" justifyContent="center">
          {!hasCommands && (
            <Grid item>
              <Icons.ThrowDice
                className={css({
                  display: "flex",
                  fontSize: "2.3rem",
                })}
              />
            </Grid>
          )}
          {Object.keys(commandsCount).map((commandId, index) => {
            const id = commandId as IDiceCommandSetId;
            const commandSet = DiceCommandGroup.getCommandSetById(id);
            const count = commandsCount[id];
            return (
              <Grid item key={index}>
                <Badge
                  badgeContent={count}
                  color="default"
                  invisible={count === 1}
                  classes={{
                    badge: css({
                      background: theme.palette.text.primary,
                      color: theme.palette.getContrastText(
                        theme.palette.text.primary
                      ),
                    }),
                  }}
                >
                  <commandSet.icon
                    className={css({
                      display: "flex",
                      fontSize: "2.3rem",
                    })}
                  />
                </Badge>
              </Grid>
            );
          })}
        </Grid>
      </Pool>
    );
  }
}

BlockDicePool.displayName = "BlockDicePool";

export function BlockDicePoolActions(
  props: IBlockActionComponentProps<IDicePoolBlock>
) {
  const { t } = useTranslate();
  const theme = useTheme();

  return (
    <>
      <Grid item>
        <Link
          component="button"
          variant="caption"
          className={css({
            color: theme.palette.primary.main,
          })}
          onClick={() => {
            props.onMetaChange({
              ...props.block.meta,
              checked:
                props.block.meta.checked === undefined ? false : undefined,
            });
          }}
          underline="hover"
        >
          {props.block.meta.checked === undefined
            ? t("character-dialog.control.add-toggle")
            : t("character-dialog.control.remove-toggle")}
        </Link>
      </Grid>
    </>
  );
}

BlockDicePoolActions.displayName = "BlockDicePoolActions";

export const Pool: React.FC<
  BoxProps & {
    clickable?: boolean;
    tooltipTitle?: string;
    selected?: boolean;
    borderRadius?: string;
    borderStyle?: string;
  }
> = (props) => {
  const {
    className,
    clickable,
    selected,
    borderRadius,
    tooltipTitle,
    borderStyle = "solid",
    ...rest
  } = props;
  const theme = useTheme();
  const hoverBackground =
    theme.palette.mode === "light" ? "#e4e4e4" : "#6b6b6b";
  const hoverColor = theme.palette.getContrastText(hoverBackground);

  const hoverBackgroundColor =
    theme.palette.mode === "light"
      ? lighten(theme.palette.primary.main, 0.9)
      : darken(theme.palette.primary.main, 0.7);

  return (
    <Tooltip title={tooltipTitle ?? ""} placement="right">
      <Box
        {...rest}
        className={cx(
          css({
            "label": "character-circle-box",
            "background": !selected
              ? theme.palette.background.paper
              : theme.palette.primary.main,
            "color": !selected
              ? theme.palette.getContrastText(theme.palette.background.paper)
              : theme.palette.getContrastText(theme.palette.primary.main),
            "border": props.clickable
              ? `1px ${borderStyle} ${theme.palette.text.primary}`
              : `none`,

            "boxShadow":
              selected || !props.clickable
                ? theme.shadows[0]
                : theme.shadows[1],
            "transition": theme.transitions.create(
              ["color", "background", "border", "borderWidth", "boxShadow"],
              { duration: theme.transitions.duration.shorter }
            ),
            "borderRadius": borderRadius ?? "24px",
            "display": "flex",
            "alignItems": "center",
            "justifyContent": "center",
            "cursor": !clickable ? "inherit" : "pointer",
            "&:hover": {
              color: !clickable || selected ? undefined : hoverColor,
              background:
                !clickable || selected ? undefined : hoverBackgroundColor,
            },
          }),
          className
        )}
      >
        <ButtonBase disabled={!props.clickable}>
          <Box
            p=".3rem"
            minWidth="50%"
            textAlign="center"
            display="flex"
            className={css({})}
          >
            {props.children}
          </Box>
        </ButtonBase>
      </Box>
    </Tooltip>
  );
};
