# Kesirlerle Bölme İşlemi Gösterimi
# "Ters çevir ve çarp" kuralı görselleştirmesi

args <- commandArgs(trailingOnly = TRUE)
out <- if (length(args) >= 1) args[[1]] else file.path("..", "figs", "division_example.svg")

pkgs <- c("ggplot2", "svglite")
for (p in pkgs) if (!requireNamespace(p, quietly = TRUE)) install.packages(p, repos = "https://cloud.r-project.org")

library(ggplot2)
library(svglite)

# Adım adım bölme işlemi gösterimi
# 1/2 ÷ 1/4 = 1/2 × 4/1 = 4/2 = 2

p <- ggplot() +
  # Ana kutu arka planı
  annotate("rect", xmin = 0, xmax = 10, ymin = 0, ymax = 4.5,
           fill = "#FAFAFA", color = "#E0E0E0", linewidth = 1) +
  
  # Adım 1: Orijinal işlem
  annotate("text", x = 0.3, y = 4, label = "Adım 1:", 
           hjust = 0, size = 4, fontface = "bold", color = "#1565C0") +
  annotate("text", x = 5, y = 4, label = "1/2  ÷  1/4", 
           size = 7, fontface = "bold", color = "#333333") +
  
  # Ok
  annotate("segment", x = 5, xend = 5, y = 3.5, yend = 3,
           arrow = arrow(length = unit(0.3, "cm")), linewidth = 1, color = "#666666") +
  
  # Adım 2: Ters çevir ve çarp
  annotate("text", x = 0.3, y = 2.5, label = "Adım 2:", 
           hjust = 0, size = 4, fontface = "bold", color = "#1565C0") +
  annotate("text", x = 5, y = 2.5, label = "1/2  ×  4/1", 
           size = 7, fontface = "bold", color = "#333333") +
  annotate("text", x = 8.5, y = 2.5, label = "(ters çevir)", 
           size = 3.5, fontface = "italic", color = "#888888") +
  
  # Ok
  annotate("segment", x = 5, xend = 5, y = 2, yend = 1.5,
           arrow = arrow(length = unit(0.3, "cm")), linewidth = 1, color = "#666666") +
  
  # Adım 3: Sonuç
  annotate("text", x = 0.3, y = 1, label = "Adım 3:", 
           hjust = 0, size = 4, fontface = "bold", color = "#1565C0") +
  annotate("text", x = 5, y = 1, label = "4/2  =  2", 
           size = 7, fontface = "bold", color = "#2E7D32") +
  
  # Sağda görsel açıklama kutusu
  annotate("rect", xmin = 10.5, xmax = 15, ymin = 0.5, ymax = 4,
           fill = "#E3F2FD", color = "#1565C0", linewidth = 1) +
  annotate("text", x = 12.75, y = 3.5, label = "KURAL", 
           size = 4.5, fontface = "bold", color = "#1565C0") +
  annotate("text", x = 12.75, y = 2.5, label = "Kesirle bölme =", 
           size = 4, color = "#333333") +
  annotate("text", x = 12.75, y = 1.8, label = "Tersini al ve çarp", 
           size = 4.5, fontface = "bold", color = "#333333") +
  annotate("text", x = 12.75, y = 1.1, label = "a/b ÷ c/d = a/b × d/c", 
           size = 3.5, fontface = "italic", color = "#666666") +
  
  # Tema
  labs(
    title = "Kesirlerle Bölme İşlemi",
    subtitle = "Ters çevir ve çarp yöntemi"
  ) +
  coord_cartesian(xlim = c(-0.5, 15.5), ylim = c(-0.5, 5)) +
  theme_void() +
  theme(
    plot.title = element_text(size = 14, face = "bold", hjust = 0.5, color = "#333333"),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "#666666"),
    plot.margin = margin(15, 15, 15, 15)
  )

dir.create(dirname(out), showWarnings = FALSE, recursive = TRUE)
svglite::svglite(out, width = 10, height = 4)
print(p)
dev.off()

cat("Yazıldı:", out, "\n")
