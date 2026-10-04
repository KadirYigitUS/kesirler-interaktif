# X-Y Ekseninde Kesir Alanı Gösterimi
# Türkçe etiketler ve ders kitabı kalitesinde görsel

args <- commandArgs(trailingOnly = TRUE)
out <- if (length(args) >= 1) args[[1]] else file.path("..", "figs", "xy_function_area.svg")

pkgs <- c("ggplot2", "svglite")
for (p in pkgs) if (!requireNamespace(p, quietly = TRUE)) install.packages(p, repos = "https://cloud.r-project.org")

library(ggplot2)
library(svglite)

# Basit doğrusal fonksiyon: y = x/2 (yarım oranı göstermek için)
x <- seq(0, 4, length.out = 100)
y <- x / 2

df <- data.frame(x = x, y = y)

# 0-2 arasındaki alan = kesir kavramını gösterir
alan_df <- subset(df, x >= 0 & x <= 2)

p <- ggplot(df, aes(x = x, y = y)) +
  # Gölgeli alan (kesir gösterimi)
  geom_ribbon(data = alan_df, aes(ymin = 0, ymax = y), 
              fill = "#81C784", alpha = 0.6) +
  # Fonksiyon çizgisi
  geom_line(color = "#1565C0", linewidth = 1.2) +
  # Eksen çizgileri
  geom_hline(yintercept = 0, linewidth = 0.8, color = "#333333") +
  geom_vline(xintercept = 0, linewidth = 0.8, color = "#333333") +
  # Alan etiketi
  annotate("text", x = 1, y = 0.3, label = "Gölgeli Alan\n= 1 birimkare", 
           size = 4, color = "#2E7D32", fontface = "bold") +
  # Eksen etiketleri ve tema
  labs(
    title = "Koordinat Düzleminde Kesir ve Alan",
    subtitle = "y = x/2 fonksiyonu altındaki alan hesabı",
    x = "Yatay Eksen (x)",
    y = "Dikey Eksen (y)"
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(size = 14, face = "bold", hjust = 0.5, color = "#333333"),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "#666666"),
    axis.title = element_text(size = 11, face = "bold"),
    axis.text = element_text(size = 10),
    panel.grid.minor = element_blank(),
    plot.margin = margin(15, 15, 15, 15)
  ) +
  scale_x_continuous(breaks = 0:4) +
  scale_y_continuous(breaks = 0:2)

dir.create(dirname(out), showWarnings = FALSE, recursive = TRUE)
svglite::svglite(out, width = 7, height = 5)
print(p)
dev.off()

cat("Yazıldı:", out, "\n")
