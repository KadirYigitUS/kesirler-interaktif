# Pay ve Payda Gösterimi
# Türkçe etiketler ve net görsel açıklama

args <- commandArgs(trailingOnly = TRUE)
out <- if (length(args) >= 1) args[[1]] else file.path("..", "figs", "terms_pay_payda.svg")

pkgs <- c("ggplot2", "svglite")
for (p in pkgs) if (!requireNamespace(p, quietly = TRUE)) install.packages(p, repos = "https://cloud.r-project.org")

library(ggplot2)
library(svglite)

# Kesir gösterimi için veri
df <- data.frame(
  x = c(0, 0, 0),
  y = c(1.5, 0.5, -0.5),
  label = c("3", "—", "4"),
  size = c(12, 8, 12)
)

# Ok ve etiket konumları
arrows_df <- data.frame(
  x_start = c(-1.2, -1.2),
  x_end = c(-0.3, -0.3),
  y_start = c(1.5, -0.5),
  y_end = c(1.5, -0.5)
)

labels_df <- data.frame(
  x = c(-2, -2),
  y = c(1.5, -0.5),
  label = c("PAY\n(üstteki sayı)", "PAYDA\n(alttaki sayı)"),
  color = c("#C62828", "#1565C0")
)

p <- ggplot() +
  # Kesir rakamları
  geom_text(data = df[1,], aes(x = x, y = y, label = label), 
            size = 18, fontface = "bold", color = "#C62828") +
  geom_text(data = df[2,], aes(x = x, y = y, label = label), 
            size = 12, fontface = "bold", color = "#333333") +
  geom_text(data = df[3,], aes(x = x, y = y, label = label), 
            size = 18, fontface = "bold", color = "#1565C0") +
  # Kesir çizgisi
  geom_segment(aes(x = -0.4, xend = 0.4, y = 0.5, yend = 0.5),
               linewidth = 2, color = "#333333") +
  # Oklar
  geom_segment(data = arrows_df, 
               aes(x = x_start, xend = x_end, y = y_start, yend = y_end),
               arrow = arrow(length = unit(0.3, "cm"), type = "closed"),
               linewidth = 1, color = "#666666") +
  # Etiketler
  geom_text(data = labels_df[1,], aes(x = x, y = y, label = label),
            size = 5, color = "#C62828", fontface = "bold", hjust = 0.5) +
  geom_text(data = labels_df[2,], aes(x = x, y = y, label = label),
            size = 5, color = "#1565C0", fontface = "bold", hjust = 0.5) +
  # Sağ tarafta açıklama kutusu
  annotate("rect", xmin = 1.2, xmax = 3.5, ymin = -1, ymax = 2.2,
           fill = "#FFF9C4", color = "#F9A825", linewidth = 1) +
  annotate("text", x = 2.35, y = 1.6, 
           label = "3/4 okunuşu:", size = 4.5, fontface = "bold") +
  annotate("text", x = 2.35, y = 0.8, 
           label = '"dörtte üç"', size = 5, fontface = "italic", color = "#333333") +
  annotate("text", x = 2.35, y = -0.2, 
           label = "4 eşit parçanın\n3 tanesi alındı", size = 4, color = "#666666") +
  # Tema ayarları
  labs(
    title = "Kesir Terimleri: Pay ve Payda",
    subtitle = "Her kesir, pay (üst) ve payda (alt) sayılarından oluşur"
  ) +
  coord_cartesian(xlim = c(-3, 4), ylim = c(-1.5, 2.5)) +
  theme_void() +
  theme(
    plot.title = element_text(size = 14, face = "bold", hjust = 0.5, color = "#333333"),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "#666666"),
    plot.margin = margin(15, 15, 15, 15)
  )

dir.create(dirname(out), showWarnings = FALSE, recursive = TRUE)
svglite::svglite(out, width = 8, height = 5)
print(p)
dev.off()

cat("Yazıldı:", out, "\n")
