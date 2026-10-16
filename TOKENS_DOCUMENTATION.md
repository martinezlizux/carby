# Design System Tokens — Carby App

Este documento detalla la estructura de tokens del sistema de diseño de Carby, asegurando la sincronización entre Figma y el código CSS.

## 1. Primitives (Colección: Primitives)
Los primitives son los valores moleculares (colores, espaciado, radio, tipografía) que sirven como fuente de verdad única.

### 🎨 Colores Base
| Categoría | Token CSS | Valor RGBA | HEX (Aprox.) |
| :--- | :--- | :--- | :--- |
| **Primary** | `--color-primary-50` | `rgba(248, 249, 255, 1)` | `#F8F9FF` |
| | `--color-primary-100` | `rgba(222, 225, 251, 1)` | `#DEE1FB` |
| | `--color-primary-200` | `rgba(194, 200, 247, 1)` | `#C2C8F7` |
| | `--color-primary-300` | `rgba(166, 175, 243, 1)` | `#A6AFF3` |
| | `--color-primary-400` | `rgba(137, 149, 239, 1)` | `#8995EF` |
| | `--color-primary-500` | `rgba(119, 129, 228, 1)` | `#7781E4` |
| | `--color-primary-600` | `rgba(95, 103, 182, 1)` | `#5F67B6` |
| | `--color-primary-700` | `rgba(71, 77, 137, 1)` | `#474D89` |
| | `--color-primary-800` | `rgba(47, 51, 91, 1)` | `#2F335B` |
| | `--color-primary-900` | `rgba(23, 26, 46, 1)` | `#171A2E` |
| **Accent** | `--color-accent-50` | `rgba(255, 241, 236, 1)` | `#FFF1EC` |
| | `--color-accent-100` | `rgba(255, 227, 217, 1)` | `#FFE3D9` |
| | `--color-accent-200` | `rgba(255, 199, 179, 1)` | `#FFC7B3` |
| | `--color-accent-300` | `rgba(255, 170, 141, 1)` | `#FFAA8D` |
| | `--color-accent-400` | `rgba(255, 141, 103, 1)` | `#FF8D67` |
| | `--color-accent-500` | `rgba(255, 116, 68, 1)` | `#FF7444` |
| | `--color-accent-600` | `rgba(204, 93, 54, 1)` | `#CC5D36` |
| | `--color-accent-700` | `rgba(153, 70, 41, 1)` | `#994629` |
| | `--color-accent-800` | `rgba(102, 46, 27, 1)` | `#662E1B` |
| | `--color-accent-900` | `rgba(51, 23, 13, 1)` | `#33170D` |
| **Neutral**| `--color-neutral-0` | `rgba(255, 255, 255, 1)` | `#FFFFFF` |
| | `--color-neutral-50` | `rgba(241, 240, 242, 1)` | `#F1F0F2` |
| | `--color-neutral-100` | `rgba(227, 225, 230, 1)` | `#E3E1E6` |
| | `--color-neutral-200` | `rgba(199, 195, 205, 1)` | `#C7C3CD` |
| | `--color-neutral-300` | `rgba(171, 165, 180, 1)` | `#ABA5B4` |
| | `--color-neutral-400` | `rgba(143, 135, 155, 1)` | `#8F879B` |
| | `--color-neutral-500` | `rgba(111, 107, 128, 1)` | `#6F6B80` |
| | `--color-neutral-600` | `rgba(89, 86, 102, 1)` | `#595666` |
| | `--color-neutral-700` | `rgba(67, 64, 77, 1)` | `#43404D` |
| | `--color-neutral-800` | `rgba(44, 43, 51, 1)` | `#2C2B33` |
| | `--color-neutral-900` | `rgba(22, 21, 26, 1)` | `#16151A` |
| **Success**| `--color-success-50` | `rgba(242, 250, 246, 1)` | `#F2FAF6` |
| | `--color-success-100` | `rgba(218, 239, 229, 1)` | `#DAEFE5` |
| | `--color-success-200` | `rgba(180, 223, 203, 1)` | `#B4DFCB` |
| | `--color-success-300` | `rgba(130, 203, 168, 1)` | `#82CBA8` |
| | `--color-success-400` | `rgba(68, 176, 124, 1)` | `#44B07C` |
| | `--color-success-500` | `rgba(5, 150, 80, 1)` | `#059650` |
| | `--color-success-600` | `rgba(4, 120, 64, 1)` | `#047840` |
| | `--color-success-700" | `rgba(3, 90, 48, 1)` | `#035A30` |
| | `--color-success-800" | `rgba(2, 60, 32, 1)` | `#023C20` |
| | `--color-success-900" | `rgba(1, 30, 16, 1)` | `#011E10` |

### 📏 Escala de Espaciado (Spacing)
| Token | Valor | Uso Típico |
| :--- | :--- | :--- |
| `--spacing-1` | 4px | Padding/Margin XS |
| `--spacing-2` | 8px | Padding/Margin S |
| `--spacing-3` | 12px | Padding/Margin SM |
| `--spacing-4` | 16px | Padding/Margin Base |
| `--spacing-5` | 20px | Padding/Margin MD |
| `--spacing-6` | 24px | Padding/Margin LG |
| `--spacing-8` | 32px | Padding/Margin XL |
| `--spacing-12` | 48px | Padding/Margin XXL |
| `--spacing-16` | 64px | Secciones / Layout |

### 📐 Radios de Borde (Radius)
| Token | Valor | Ejemplo |
| :--- | :--- | :--- |
| `--radius-none` | 0px | Cuadrado |
| `--radius-xs` | 2px | Inputs sutiles |
| `--radius-sm" | 4px | Botones secundarios |
| `--radius-md` | 8px | Cards base |
| `--radius-lg` | 12px | Cards principales |
| `--radius-xl` | 16px | Modales / Secciones |
| `--radius-2xl` | 24px | Layout circular suave |
| `--radius-full` | 9999px | Botones Píldora / Avatares |

### 🔡 Tipografía (Primitives)
**Fuentes (Families):**
- `--typography-family-body`: 'Inter'
- `--typography-family-heading`: 'Outfit'

**Escalas de Tamaño (Scale):**
- `--typography-scale-100`: 12px
- `--typography-scale-200`: 14px
- `--typography-scale-300`: 16px
- `--typography-scale-400`: 20px
- `--typography-scale-500`: 24px
- `--typography-scale-600`: 32px
- `--typography-scale-700`: 40px
- `--typography-scale-800`: 48px
- `--typography-scale-900`: 56px

**Pesos (Weights):**
- `--typography-weight-light`: 300
- `--typography-weight-regular`: 400
- `--typography-weight-medium`: 500
- `--typography-weight-semi-bold`: 600
- `--typography-weight-bold`: 700
- `--typography-weight-extra-bold`: 800

---

## 2. Semantics (Colección: Semantics)
Los tokens semánticos definen el *rol* de un primitive en el sistema.

### Surface Tokens (Fondos)
| Categoría | Lighter | Light | Base | Dark | Darker |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary** | `--surface-primary-bg-lighter` | `--surface-primary-bg-light` | `--surface-primary-bg-base` | `--surface-primary-bg-dark` | `--surface-primary-bg-darker` |
| **Accent** | `--surface-accent-bg-lighter` | `--surface-accent-bg-light` | `--surface-accent-bg-base` | `--surface-accent-bg-dark` | `--surface-accent-bg-darker` |
| **Neutral** | `--surface-neutral-bg-lighter` | `--surface-neutral-bg-light` | `--surface-neutral-bg-base` | `--surface-neutral-bg-dark` | `--surface-neutral-bg-darker` |
| **Success** | `--surface-success-bg-lighter` | `--surface-success-bg-light` | `--surface-success-bg-base` | `--surface-success-bg-dark` | `--surface-success-bg-darker` |

### Border Tokens (Bordes)
| Categoría | Light | Base | Dark |
| :--- | :--- | :--- | :--- |
| **Primary** | `--border-primary-light` | `--border-primary-base` | `--border-primary-dark` |
| **Accent** | `--border-accent-light` | `--border-accent-base` | `--border-accent-dark` |
| **Neutral** | `--border-neutral-light` | `--border-neutral-base` | `--border-neutral-dark` |
| **Success** | `--border-success-light` | `--border-success-base` | `--border-success-dark` |

### Text Tokens (Texto)
| Categoría | Lighter | Light | Base | Dark | Darker |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary** | `--text-primary-lighter` | `--text-primary-light` | `--text-primary-base` | `--text-primary-dark` | `--text-primary-darker` |
| **Accent** | `--text-accent-lighter` | `--text-accent-light` | `--text-accent-base` | `--text-accent-dark` | `--text-accent-darker` |
| **Neutral** | `--text-neutral-lighter` | `--text-neutral-light` | `--text-neutral-base` | `--text-neutral-dark` | `--text-neutral-darker` |
| **Success** | `--text-success-lighter` | `--text-success-light` | `--text-success-base` | `--text-success-dark` | `--text-success-darker` |

**Links:**
- `--text-links-primary`: Primario 600
- `--text-links-accent`: Accent 500

### Tipografía Aplicada (Semantic Typography)
| Estilo | Font Size | Font Family | Font Weight |
| :--- | :--- | :--- | :--- |
| **Display** | `var(--typography-scale-900)` | Heading | Bold |
| **Heading 1** | `var(--typography-scale-700)` | Heading | Extra Bold |
| **Heading 2** | `var(--typography-scale-600)` | Heading | Extra Bold |
| **Heading 3** | `var(--typography-scale-500)` | Heading | Extra Bold |
| **Body Large** | `var(--typography-scale-400)` | Body | Medium |
| **Body Base** | `var(--typography-scale-300)` | Body | Medium |
| **Body Small** | `var(--typography-scale-200)` | Body | Regular |
| **Caption** | `var(--typography-scale-100)` | Body | Regular |

---

## 3. Guía de Implementación
Para mantener la consistencia, usa siempre los tokens semánticos sobre los primitives cuando sea posible.

```css
.card {
  background-color: var(--surface-primary-bg-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4);
  color: var(--text-neutral-darker);
}
```

