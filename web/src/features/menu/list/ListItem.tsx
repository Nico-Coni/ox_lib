import { Box, createStyles, Group, Progress, Stack, Text } from '@mantine/core';
import React, { forwardRef } from 'react';
import CustomCheckbox from './CustomCheckbox';
import type { MenuItem } from '../../../typings';
import { isIconUrl } from '../../../utils/isIconUrl';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import LibIcon from '../../../components/LibIcon';

interface Props {
  item: MenuItem;
  index: number;
  scrollIndex: number;
  checked: boolean;
}

const useStyles = createStyles((theme, params: { iconColor?: string }) => ({
  buttonContainer: {
    backgroundColor: 'rgba(37, 38, 43, 0.85)',
    borderRadius: theme.radius.md,
    padding: 2,
    height: 60,
    scrollMargin: 8,
    '&:focus': {
      backgroundColor: 'rgba(37, 38, 43, 1)',
      outline: 'none',
    },
  },
  iconImage: {
    maxWidth: 32,
  },
  buttonWrapper: {
    paddingLeft: 5,
    paddingRight: 12,
    height: '100%',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
  icon: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  label: {
    color: theme.colors.dark[2],
    textTransform: 'uppercase',
    fontSize: 12,
    verticalAlign: 'middle',
  },
  chevronIcon: {
    fontSize: 14,
    color: theme.colors.dark[2],
  },
  scrollIndexValue: {
    color: theme.colors.dark[2],
    textTransform: 'uppercase',
    fontSize: 14,
  },
  progressStack: {
    width: '100%',
    marginRight: 5,
  },
  progressLabel: {
    verticalAlign: 'middle',
    marginBottom: 3,
  },
}));

// 0% -> rouge, 100% -> blanc
const getProgressColor = (value: number) => {
  // Clamp pour être sûr que value soit entre 0 et 100
  const progress = Math.min(100, Math.max(0, value));

  // Rouge de départ (R=255, G=0, B=0)
  const start = { r: 255, g: 0, b: 0 };

  // Blanc de fin (R=255, G=255, B=255)
  const end = { r: 255, g: 255, b: 255 };

  // Interpolation linéaire
  const r = Math.round(start.r + ((end.r - start.r) * progress) / 100);
  const g = Math.round(start.g + ((end.g - start.g) * progress) / 100);
  const b = Math.round(start.b + ((end.b - start.b) * progress) / 100);

  return `rgb(${r}, ${g}, ${b})`;
};

const ListItem = forwardRef<Array<HTMLDivElement | null>, Props>(({ item, index, scrollIndex, checked }, ref) => {
  const { classes } = useStyles({ iconColor: item.iconColor });

  return (
    <Box
      tabIndex={index}
      className={classes.buttonContainer}
      key={`item-${index}`}
      ref={(element: HTMLDivElement) => {
        if (ref)
          // @ts-ignore i cba
          return (ref.current = [...ref.current, element]);
      }}
    >
      <Group spacing={15} noWrap className={classes.buttonWrapper}>
        {item.icon && (
          <Box className={classes.iconContainer}>
            {typeof item.icon === 'string' && isIconUrl(item.icon) ? (
              <img src={item.icon} alt="Missing image" className={classes.iconImage} />
            ) : (
              <LibIcon
                icon={item.icon as IconProp}
                className={classes.icon}
                fixedWidth
                animation={item.iconAnimation}
              />
            )}
          </Box>
        )}
        {Array.isArray(item.values) ? (
          <Group position="apart" w="100%">
            <Stack spacing={0} justify="space-between">
              <Text className={classes.label}>{item.label}</Text>
              <Text>
                {typeof item.values[scrollIndex] === 'object'
                  ? // @ts-ignore for some reason even checking the type TS still thinks it's a string
                  item.values[scrollIndex].label
                  : item.values[scrollIndex]}
              </Text>
            </Stack>
            <Group spacing={1} position="center">
              <LibIcon icon="chevron-left" className={classes.chevronIcon} />
              <Text className={classes.scrollIndexValue}>
                {scrollIndex + 1}/{item.values.length}
              </Text>
              <LibIcon icon="chevron-right" className={classes.chevronIcon} />
            </Group>
          </Group>
        ) : item.checked !== undefined ? (
          <Group position="apart" w="100%">
            <Text>{item.label}</Text>
            <CustomCheckbox checked={checked}></CustomCheckbox>
          </Group>
        ) : item.progress !== undefined ? (
          <Stack className={classes.progressStack} spacing={0}>
            <Text className={classes.progressLabel}>{item.label}</Text>
            <Group spacing={5} align="center">

              {/* Barre de progression */}
              <Progress
                value={item.progress}
                styles={{
                  root: {
                    backgroundColor: 'rgba(20,20,20,0.85)',
                    flex: 1, // prend toute la place disponible
                    minWidth: 50, // pour être sûr qu'elle ait une largeur
                  },
                  bar: {
                    backgroundColor: getProgressColor(item.progress),
                    borderRadius: 4,
                  },
                }}
              />
            </Group>
          </Stack>
        ) : (
          <Text>{item.label}</Text>
        )}
      </Group>
    </Box>
  );
});

export default React.memo(ListItem);
