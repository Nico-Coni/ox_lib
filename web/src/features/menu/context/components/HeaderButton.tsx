import { Button, createStyles, keyframes } from '@mantine/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import LibIcon from '../../../../components/LibIcon';

interface Props {
  icon: IconProp;
  canClose?: boolean;
  iconSize: number;
  handleClick: () => void;
}

const bounceAndGlow = keyframes({
  '0%': {
    transform: 'scale(1)',
    filter: 'drop-shadow(0 0 0 rgba(12, 104, 225, 0))',
  },
  '100%': {
    transform: 'scale(1.02)',
    filter: 'drop-shadow(0 0 10px rgba(12, 104, 225, 0.6))',
  }
});

const useStyles = createStyles((theme, params: { canClose?: boolean }) => ({
  button: {
    borderRadius: 15,
    flex: '1 15%',
    alignSelf: 'stretch',
    height: 'auto',
    textAlign: 'center',
    justifyContent: 'center',
    padding: 2,
    backgroundColor: 'rgba(5,5,5,0.90)',
    '&:hover': {
      backgroundColor: params.canClose === false ? undefined : 'rgba(7, 34, 73, 0.9)',
      cursor: params.canClose === false ? 'unset' : 'pointer',
      animation: params.canClose === false ? 'unset' : `${bounceAndGlow} 0.7s ease-in-out infinite alternate`,
    },
  },
  root: {
    border: 'none',
  },
  label: {
    color: params.canClose === false ? theme.colors.dark[2] : theme.colors.dark[0],
  },
}
));

const HeaderButton: React.FC<Props> = ({ icon, canClose, iconSize, handleClick }) => {
  const { classes } = useStyles({ canClose });

  return (
    <Button
      variant="default"
      className={classes.button}
      classNames={{ label: classes.label, root: classes.root }}
      disabled={canClose === false}
      onClick={handleClick}
    >
      <LibIcon icon={icon} fontSize={iconSize} fixedWidth />
    </Button>
  );
};

export default HeaderButton;
