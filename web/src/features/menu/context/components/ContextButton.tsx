import { Button, createStyles, Group, HoverCard, Image, Progress, Stack, Text, keyframes } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import { ContextMenuProps, Option } from '../../../../typings';
import { fetchNui } from '../../../../utils/fetchNui';
import { isIconUrl } from '../../../../utils/isIconUrl';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import MarkdownComponents from '../../../../config/MarkdownComponents';
import LibIcon from '../../../../components/LibIcon';

const openMenu = (id: string | undefined) => {
  fetchNui<ContextMenuProps>('openContext', { id: id, back: false });
};

const clickContext = (id: string) => {
  fetchNui('clickContext', id);
};

const bounceAndGlow = keyframes({
  '0%': {
    transform: 'scale(1)',
    filter: 'drop-shadow(0 0 0 rgba(12, 104, 225, 0))',
  },
  '100%': {
    transform: 'scale(0.98)',
    filter: 'drop-shadow(0 0 10px rgba(12, 104, 225, 0.6))',
  }
});

const useStyles = createStyles((theme, params: { disabled?: boolean; readOnly?: boolean }) => ({
  inner: {
    justifyContent: 'flex-start',
  },
  label: {
    width: '100%',
    color: params.disabled ? theme.colors.dark[0] : theme.colors.dark[0],
    whiteSpace: 'pre-wrap',
  },
  button: {
    height: 'fit-content',
    width: '100%',
    backgroundColor: params.disabled
      ? 'rgba(66, 66, 66, 0.66) !important'
      : 'rgba(5, 5, 5, 0.90)',
    borderRadius: 15,
    padding: 10,
    '&:hover': {
      backgroundColor: 'rgba(7, 34, 73, 0.9)',
      cursor: params.readOnly ? 'unset' : 'pointer',
      animation: params.readOnly ? 'unset' : `${bounceAndGlow} 0.7s ease-in-out infinite alternate`,
    },
    '&:active': {
      transform: params.readOnly ? 'unset' : undefined,
    },
  },
  iconImage: {
    maxWidth: '25px',
  },
  description: {
    color: params.disabled ? theme.colors.dark[0] : theme.colors.dark[2],
    fontSize: 12,
  },
  dropdown: {
    padding: 10,
    color: theme.colors.dark[0],
    borderRadius: 10,
    fontSize: 14,
    maxWidth: 256,
    width: 'fit-content',
    border: 'none',
    backgroundColor: 'rgba(5,5,5,0.90)',
  },
  buttonStack: {
    gap: 4,
    flex: '1',
  },
  buttonGroup: {
    gap: 4,
    flexWrap: 'nowrap',
  },
  buttonIconContainer: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonTitleText: {
    overflowWrap: 'break-word',
  },
  buttonArrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 25,
    height: 25,
  },
}));

const getProgressColor = (value: number) => {
  // Clamp pour être sûr que value soit entre 0 et 100
  const progress = Math.min(100, Math.max(0, value));

  // Rouge de départ (R=255, G=0, B=0)
  const start = { r: 255, g: 165, b: 0 };

  // Blanc de fin (R=255, G=255, B=255)
  const end = { r: 5, g: 120, b: 255 };

  // Interpolation linéaire
  const r = Math.round(start.r + ((end.r - start.r) * progress) / 100);
  const g = Math.round(start.g + ((end.g - start.g) * progress) / 100);
  const b = Math.round(start.b + ((end.b - start.b) * progress) / 100);

  return `rgb(${r}, ${g}, ${b})`;
};

const ContextButton: React.FC<{
  option: [string, Option];
}> = ({ option }) => {
  const button = option[1];
  const buttonKey = option[0];
  const { classes } = useStyles({ disabled: button.disabled, readOnly: button.readOnly });


  return (
    <>
      <HoverCard
        position="right-start"
        disabled={button.disabled || !(button.metadata || button.image)}
        openDelay={200}
      >
        <HoverCard.Target>
          <Button
            classNames={{ inner: classes.inner, label: classes.label, root: classes.button }}
            onClick={() =>
              !button.disabled && !button.readOnly
                ? button.menu
                  ? openMenu(button.menu)
                  : clickContext(buttonKey)
                : null
            }
            variant="default"
            disabled={button.disabled}
          >
            <Group position="apart" w="100%" noWrap>
              <Stack className={classes.buttonStack}>
                {(button.title || Number.isNaN(+buttonKey)) && (
                  <Group className={classes.buttonGroup}>
                    {button?.icon && (
                      <Stack className={classes.buttonIconContainer}>
                        {typeof button.icon === 'string' && isIconUrl(button.icon) ? (
                          <img src={button.icon} className={classes.iconImage} alt="Missing img" />
                        ) : (
                          <LibIcon
                            icon={button.icon as IconProp}
                            fixedWidth
                            size="lg"
                            style={{ color: button.iconColor }}
                            animation={button.iconAnimation}
                          />
                        )}
                      </Stack>
                    )}
                    <Text className={classes.buttonTitleText}>
                      <ReactMarkdown components={MarkdownComponents}>{button.title || buttonKey}</ReactMarkdown>
                    </Text>
                  </Group>
                )}
                {button.description && (
                  <Text className={classes.description}>
                    <ReactMarkdown components={MarkdownComponents}>{button.description}</ReactMarkdown>
                  </Text>
                )}
                {button.progress !== undefined && (
                  <Progress
                    value={button.progress}
                    size="sm"
                    styles={{
                      root: {
                        minWidth: 150, // Largeur fixe pour forcer l'affichage dans le dropdown
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 4,
                      },
                      bar: {
                        // On force la couleur avec !important pour écraser le thème Mantine
                        backgroundColor: `${getProgressColor(button.progress)} !important`,
                        transition: 'width 0.4s ease, background-color 0.4s ease',
                      },
                    }}
                  />
                )}
              </Stack>
              {(button.menu || button.arrow) && button.arrow !== false && (
                <Stack className={classes.buttonArrowContainer}>
                  <LibIcon icon="chevron-right" fixedWidth />
                </Stack>
              )}
            </Group>
          </Button>
        </HoverCard.Target>
        <HoverCard.Dropdown className={classes.dropdown}>
          {button.image && <Image src={button.image} mb={10} />}

          {Array.isArray(button.metadata) ? (
            button.metadata.map((metadata: any, index: number) => {
              // SÉCURITÉ : On s'assure que c'est bien un nombre

              return (
                <Stack key={`metadata-${index}`} spacing={4} mb={8}>
                  <Text size="xs" weight={500}>
                    {typeof metadata === 'string'
                      ? `${metadata}`
                      : `${metadata.label}: ${metadata?.value ?? ''}`}
                  </Text>

                  {metadata.progress !== undefined && (
                    <Progress
                      value={metadata.progress}
                      size="sm"
                      styles={{
                        root: {
                          minWidth: 150, // Largeur fixe pour forcer l'affichage dans le dropdown
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: 4,
                        },
                        bar: {
                          // On force la couleur avec !important pour écraser le thème Mantine
                          backgroundColor: `${getProgressColor(metadata.progress)} !important`,
                          transition: 'width 0.4s ease, background-color 0.4s ease',
                        },
                      }}
                    />
                  )}
                </Stack>
              );
            })
          ) : (
            // ... reste de ton code pour les objets simples
            <Stack spacing={2}>
              {typeof button.metadata === 'object' &&
                Object.entries(button.metadata).map(([key, value], index) => (
                  <Text key={`meta-obj-${index}`} size="xs">
                    {key}: {value as React.ReactNode}
                  </Text>
                ))}
            </Stack>
          )}
        </HoverCard.Dropdown>
      </HoverCard >
    </>
  );
};

export default ContextButton;
