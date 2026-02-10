import { Box, createStyles, keyframes } from '@mantine/core';
import { useEffect, useState } from 'react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { useNuiEvent } from '../../../hooks/useNuiEvent';
import { fetchNui } from '../../../utils/fetchNui';
import { isIconUrl } from '../../../utils/isIconUrl';
import ScaleFade from '../../../transitions/ScaleFade';
import type { RadialMenuItem } from '../../../typings';
import { useLocales } from '../../../providers/LocaleProvider';
import LibIcon from '../../../components/LibIcon';

// --- ANIMATIONS ---

const bounceAndGlow = keyframes({
  '0%': {
    transform: 'translate(0, 0) scale(1)',
    filter: 'drop-shadow(0 0 0 rgba(12, 104, 225, 0))',
  },
  '100%': {
    transform: 'translate(var(--tx), var(--ty)) scale(1.02)',
    filter: 'drop-shadow(0 0 20px rgba(12, 104, 225, 0.6))',
  }
});

// Animation pour le cercle SVG (pas de translate nécessaire ici)
const centerCirclePulse = keyframes({
  '0%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(12, 104, 225, 0))' },
  '100%': { transform: 'scale(1.15)', filter: 'drop-shadow(0 0 12px rgba(12, 104, 225, 0.7))' },
});

// Animation pour l'icône HTML (ON GARDE LE TRANSLATE -50% ICI)
const centerIconPulse = keyframes({
  '0%': { transform: 'translate(-50%, -50%) scale(1)' },
  '100%': { transform: 'translate(-50%, -50%) scale(1.15)' },
});

// --- STYLES ---
const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
  },
  glowing: {
    animation: `${bounceAndGlow} 0.8s infinite alternate ease-in-out`,
    transformBox: 'fill-box',
  },
  pathWithShadow: {
    filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.7))',
  },
  overlayLayer: {
    fill: 'transparent',
    transition: 'fill 0.2s ease',
    cursor: 'pointer',
    '&:hover': {
      fill: 'rgba(12, 104, 225, 0.35)',
    },
  },
  backgroundCircle: {
    fill: 'rgba(5,5,5,0)',
  },
  // Animation du cercle noir central
  centerCircleGlowing: {
    animation: `${centerCirclePulse} 0.8s infinite alternate ease-in-out`,
    transformOrigin: 'center',
    transformBox: 'fill-box',
  },
  centerIconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)', // Centrage statique
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Animation de la croix (synchronisée)
  centerIconGlowing: {
    animation: `${centerIconPulse} 0.8s infinite alternate ease-in-out`,
  },
  centerIcon: {
    color: '#fff',
  },
}));

// --- UTILS ---
const calculateFontSize = (text: string): number => {
  if (text.length > 22) return 10;
  if (text.length > 16) return 11;
  return 13;
};

const splitTextIntoLines = (text: string, maxCharPerLine: number = 15): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];
  for (let i = 1; i < words.length; i++) {
    if (currentLine.length + words[i].length + 1 <= maxCharPerLine) {
      currentLine += ' ' + words[i];
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return lines;
};

const PAGE_ITEMS = 6;
const degToRad = (deg: number) => deg * (Math.PI / 180);

const RadialMenu: React.FC = () => {
  const { classes, cx } = useStyles();
  const { locale } = useLocales();
  const newDimension = 350 * 1.1025;
  const [visible, setVisible] = useState(false);
  const [menuItems, setMenuItems] = useState<RadialMenuItem[]>([]);
  const [hovered, setHovered] = useState<number | null>(null);
  const [centerHovered, setCenterHovered] = useState(false);

  const [menu, setMenu] = useState<{ items: RadialMenuItem[]; sub?: boolean; page: number }>({
    items: [],
    sub: false,
    page: 1,
  });

  const changePage = async (increment?: boolean) => {
    setVisible(false);
    setHovered(null);
    setCenterHovered(false);
    const didTransition: boolean = await fetchNui('radialTransition');
    if (!didTransition) return;
    setVisible(true);
    setMenu({ ...menu, page: increment ? menu.page + 1 : menu.page - 1 });
  };

  useEffect(() => {
    if (menu.items.length <= PAGE_ITEMS) return setMenuItems(menu.items);
    const items = menu.items.slice(
      PAGE_ITEMS * (menu.page - 1) - (menu.page - 1),
      PAGE_ITEMS * menu.page - menu.page + 1
    );
    if (PAGE_ITEMS * menu.page - menu.page + 1 < menu.items.length) {
      items[items.length - 1] = { icon: 'ellipsis-h', label: locale.ui.more, isMore: true };
    }
    setMenuItems(items);
  }, [menu.items, menu.page]);

  useNuiEvent('openRadialMenu', async (data: { items: RadialMenuItem[]; sub?: boolean; option?: string } | false) => {
    if (!data) return setVisible(false);
    let initialPage = 1;
    if (data.option) {
      data.items.findIndex(
        (item, index) => item.menu == data.option && (initialPage = Math.floor(index / PAGE_ITEMS) + 1)
      );
    }
    setMenu({ ...data, page: initialPage });
    setVisible(true);
  });

  useNuiEvent('refreshItems', (data: RadialMenuItem[]) => {
    setMenu({ ...menu, items: data });
  });

  return (
    <Box
      className={classes.wrapper}
      onContextMenu={async () => {
        if (menu.page > 1) await changePage();
        else if (menu.sub) fetchNui('radialBack');
      }}
    >
      <ScaleFade visible={visible}>
        <svg
          style={{ overflow: 'visible' }}
          width={`${newDimension}px`}
          height={`${newDimension}px`}
          viewBox="0 0 350 350"
          transform="rotate(90)"
        >
          {/* --- BOUCLE 1 : TUILES --- */}
          {menuItems.map((item, index) => {
            const pieAngle = 360 / (menuItems.length < 3 ? 3 : menuItems.length);
            const startAngle = degToRad(-0.1);
            const endAngle = degToRad(pieAngle + 0.1);
            const innerRadius = 55;
            const outerRadius = 185;

            const x1 = 175 + innerRadius * Math.cos(startAngle);
            const y1 = 175 + innerRadius * Math.sin(startAngle);
            const x2 = 175 + outerRadius * Math.cos(startAngle);
            const y2 = 175 + outerRadius * Math.sin(startAngle);
            const x3 = 175 + outerRadius * Math.cos(endAngle);
            const y3 = 175 + outerRadius * Math.sin(endAngle);
            const x4 = 175 + innerRadius * Math.cos(endAngle);
            const y4 = 175 + innerRadius * Math.sin(endAngle);

            const pathData = `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;

            const midAngle = degToRad(pieAngle / 2);
            const bounceDist = 8;
            const tx = bounceDist * Math.cos(midAngle);
            const ty = bounceDist * Math.sin(midAngle);

            return (
              <g key={`tile-${index}`} transform={`rotate(-${index * pieAngle} 175 175)`}>
                <g
                  className={hovered === index ? classes.glowing : ''}
                  style={{ '--tx': `${tx}px`, '--ty': `${ty}px` } as React.CSSProperties}
                >
                  <path d={pathData} fill="rgba(5, 5, 5, 0.85)" className={classes.pathWithShadow} />
                  <path
                    d={pathData}
                    className={classes.overlayLayer}
                    onMouseEnter={() => setHovered(index)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={async (e) => {
                      e.stopPropagation();
                      const clickIndex = menu.page === 1 ? index : PAGE_ITEMS * (menu.page - 1) - (menu.page - 1) + index;
                      if (!item.isMore) fetchNui('radialClick', clickIndex);
                      else await changePage(true);
                    }}
                  />
                </g>
              </g>
            );
          })}

          {/* --- BOUCLE 2 : CONTENU --- */}
          {menuItems.map((item, index) => {
            const pieAngle = 360 / (menuItems.length < 3 ? 3 : menuItems.length);
            const radius = 120;
            const angle = degToRad(pieAngle / 2);
            const iconX = 175 + radius * Math.cos(angle);
            const iconY = 175 + radius * Math.sin(angle);
            const iconWidth = Math.min(Math.max(item.iconWidth || 50, 0), 100);
            const iconHeight = Math.min(Math.max(item.iconHeight || 50, 0), 100);

            const midAngle = degToRad(pieAngle / 2);
            const bounceDist = 8;
            const tx = bounceDist * Math.cos(midAngle);
            const ty = bounceDist * Math.sin(midAngle);

            return (
              <g key={`content-${index}`} style={{ pointerEvents: 'none', isolation: 'isolate' }}>
                <g transform={`rotate(-${index * pieAngle} 175 175)`}>
                  <g
                    className={hovered === index ? classes.glowing : ''}
                    style={{ '--tx': `${tx}px`, '--ty': `${ty}px` } as React.CSSProperties}
                  >
                    <g transform={`translate(${iconX}, ${iconY}) rotate(${index * pieAngle - 90})`}>
                      {typeof item.icon === 'string' && isIconUrl(item.icon) ? (
                        <image
                          href={item.icon}
                          width={iconWidth}
                          height={iconHeight}
                          x={-iconWidth / 2}
                          y={-10 - iconHeight / 2}
                          style={{ filter: 'brightness(0) invert(1)', opacity: 1 }}
                        />
                      ) : (
                        <LibIcon x={-15} y={-10 - 15} icon={item.icon as IconProp} width={30} height={30} fixedWidth color="#FFFFFF" />
                      )}
                      <text x={0} y={10} fill="#FFFFFF" textAnchor="middle" fontSize={calculateFontSize(item.label)} fontWeight={600} style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.9)', dominantBaseline: "hanging" }}>
                        {splitTextIntoLines(item.label, 15).map((line, idx) => (
                          <tspan x={0} dy={idx === 0 ? 0 : '1.2em'} key={idx} fill="#FFFFFF">{line}</tspan>
                        ))}
                      </text>
                    </g>
                  </g>
                </g>
              </g>
            );
          })}

          {/* --- BOUTON CENTRAL (EXIT) --- */}
          <g
            transform={`translate(175, 175)`}
            onMouseEnter={() => setCenterHovered(true)}
            onMouseLeave={() => setCenterHovered(false)}
            onClick={async () => {
              if (menu.page > 1) await changePage();
              else {
                if (menu.sub) fetchNui('radialBack');
                else { setVisible(false); fetchNui('radialClose'); }
              }
            }}
          >
            {/* Le groupe qui contient tout le centre pour un scale parfait */}
            <g className={cx({ [classes.centerCircleGlowing]: centerHovered })}>
              {/* 1. FOND NOIR */}
              <circle r={28} fill="rgba(5,5,5,0.85)" className={classes.pathWithShadow} />

              {/* 2. L'ICÔNE (Directement dans le SVG maintenant) */}
              {/* On la redresse car le SVG parent est tourné à 90° */}
              <g transform="rotate(-90)">
                <foreignObject x="-15" y="-15" width="30" height="30">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    color: 'white'
                  }}>
                    <LibIcon
                      icon={!menu.sub && menu.page < 2 ? 'xmark' : 'arrow-rotate-left'}
                      fixedWidth
                      size="2x"
                    />
                  </div>
                </foreignObject>
              </g>

              {/* 3. SURCOUCHE INTERACTIVE (C'est elle qui prend le clic) */}
              <circle r={28} className={classes.overlayLayer} />
            </g>
          </g>
        </svg>

        {/* ON SUPPRIME LE DIV centerIconContainer QUI ÉTAIT ICI */}
      </ScaleFade>
    </Box>
  );
};

export default RadialMenu;