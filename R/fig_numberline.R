# Sayı Doğrusu Üzerinde Kesir Gösterimleri
# Türkçe etiketler ve ders kitabı kalitesinde görsel

args <- commandArgs(trailingOnly = TRUE)
out <- if (length(args) >= 1) args[[1]] else file.path("..", "figs", "numberline_fractions.svg")

pkgs <- c("ggplot2", "svglite")
for (p in pkgs) if (!requireNamespace(p, quietly = TRUE)) install.packages(p, repos = "https://cloud.r-project.org")

library(ggplot2)
library(svglite)

# Sayı doğrusu verileri: 0'dan 2'ye kadar önemli kesirler
ana_sayilar <- seq(-50, 50, by = 10)
marks <- data.frame(
  x = c(ana_sayilar, -25.5, 25.5, -45.2, 33.3),
  label = c(as.character(ana_sayilar), "-51/2", "51/2", "-226/5", "333/10"),
  tip = c(rep("tam", length(ana_sayilar)), "kesir", "kesir", "kesir", "kesir")
)

# Renk paleti
renkler <- c("tam" = "#E53935", "kesir" = "#1E88E5")

p <- ggplot() +
  # Ana çizgi
  geom_segment(aes(x = -52, xend = 52, y = 0, yend = 0), 
               linewidth = 1.2, color = "#333333") +
  # Ok uçları
  geom_segment(aes(x = 50.5, xend = 52, y = 0.02, yend = 0), 
               linewidth = 1, color = "#333333") +
  geom_segment(aes(x = 50.5, xend = 52, y = -0.02, yend = 0), 
               linewidth = 1, color = "#333333") +
  # Noktalar
  geom_point(data = marks, aes(x = x, y = 0, color = tip), size = 4) +
  scale_color_manual(values = renkler, name = "Sayı Türü",
                     labels = c("tam" = "Tam Sayı", "kesir" = "Kesir")) +
  # Etiketler
  geom_text(data = marks, aes(x = x, y = -0.08, label = label), 
            vjust = 1, size = 4, fontface = "bold") +
  # Küçük çizgiler (tick marks)
  geom_segment(data = marks, aes(x = x, xend = x, y = -0.02, yend = 0.02), 
               linewidth = 0.8, color = "#333333") +
  theme_void() +
  theme(
    plot.title = element_text(size = 14, face = "bold", hjust = 0.5, color = "#333333"),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "#666666"),
    legend.position = "bottom",
    legend.title = element_text(size = 10, face = "bold"),
    plot.margin = margin(20, 20, 20, 20)
  ) +
  labs(
    title = "Sayı Doğrusunda Kesirler",
    subtitle = "0 ile 2 arasındaki kesir ve tam sayıların konumları"
  ) +
  xlim(-51, 51) +
  ylim(-0.2, 0.5)

dir.create(dirname(out), showWarnings = FALSE, recursive = TRUE)
svglite::svglite(out, width = 10, height = 3)
print(p)
dev.off()

cat("Yazıldı:", out, "\n")
