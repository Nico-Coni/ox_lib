import { Button, createStyles, Group, Modal, Stack, useMantineTheme, keyframes } from '@mantine/core';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { fetchNui } from '../../utils/fetchNui';
import { useLocales } from '../../providers/LocaleProvider';
import remarkGfm from 'remark-gfm';
import type { AlertProps } from '../../typings';
import MarkdownComponents from '../../config/MarkdownComponents';
import { title } from 'process';


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

const useStyles = createStyles((theme) => ({
  modalbody: {
    backgroundColor: 'rgba(5, 5, 5, 0.9)',
    borderRadius: 10,
  },
  modalHeader: {
    color: theme.white,
    fontSize: 18,

  },
  cancelBtn: {
    backgroundColor: 'rgba(60, 60, 60, 0.5)',
    border: 'none',
    color: theme.white,
    '&:hover': {
      backgroundColor: 'rgba(80, 80, 80, 0.8)',
      animation: `${bounceAndGlow} 0.7s ease-in-out infinite alternate`,
    }
  },
  confirmBtn: {
    backgroundColor: 'rgba(7, 34, 73, 0.9)',
    color: theme.white,
    '&:hover': {
      backgroundColor: 'rgba(12, 104, 225, 0.9)',
      animation: `${bounceAndGlow} 0.7s ease-in-out infinite alternate`,
    }
  },
  contentStack: {
    color: theme.colors.dark[3],
  },
}));

const AlertDialog: React.FC = () => {
  const { locale } = useLocales();
  const { classes } = useStyles();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [dialogData, setDialogData] = useState<AlertProps>({
    header: '',
    content: '',
  });

  const closeAlert = (button: string) => {
    setOpened(false);
    fetchNui('closeAlert', button);
  };

  useNuiEvent('sendAlert', (data: AlertProps) => {
    setDialogData(data);
    setOpened(true);
  });

  useNuiEvent('closeAlertDialog', () => {
    setOpened(false);
  });

  return (
    <>
      <Modal
        opened={opened}
        centered={dialogData.centered}
        size={dialogData.size || 'md'}
        overflow={dialogData.overflow ? 'inside' : 'outside'}
        closeOnClickOutside={false}
        onClose={() => {
          setOpened(false);
          closeAlert('cancel');
        }}
        withCloseButton={false}
        overlayOpacity={0.4}
        overlayBlur={0}
        exitTransitionDuration={150}
        transition="fade"
        title={<ReactMarkdown components={MarkdownComponents}>{dialogData.header}</ReactMarkdown>}
        classNames={{
          modal: classes.modalbody,
          title: classes.modalHeader
        }}
      >
        <Stack className={classes.contentStack}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              ...MarkdownComponents,
              img: ({ ...props }) => <img style={{ maxWidth: '100%', maxHeight: '100%' }} {...props} />,
            }}
          >
            {dialogData.content}
          </ReactMarkdown>
          <Group position="right" spacing={10}>
            {dialogData.cancel && (
              <Button
                className={classes.cancelBtn}
                uppercase
                variant="default"
                onClick={() => closeAlert('cancel')} mr={3}>
                {dialogData.labels?.cancel || locale.ui.cancel}
              </Button>
            )}
            <Button
              className={classes.confirmBtn}
              uppercase
              variant={dialogData.cancel ? 'light' : 'default'}
              color={dialogData.cancel ? theme.primaryColor : undefined}
              onClick={() => closeAlert('confirm')}
            >
              {dialogData.labels?.confirm || locale.ui.confirm}
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default AlertDialog;
