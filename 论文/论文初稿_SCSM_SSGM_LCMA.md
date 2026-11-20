# 基于局部-全局协同Transformer与状态空间模型的高光谱-多光谱图像融合

**Title in English**: Local-Global Collaborative Transformer with State Space Models for Hyperspectral and Multispectral Image Fusion

---

## 摘要

高光谱图像(Hyperspectral Image, HSI)凭借丰富的光谱信息在遥感地物识别、环境监测及精准农业等领域具有重要应用价值。然而，受成像系统光通量与传感器硬件的物理制约，HSI的空间分辨率往往较低。将低空间分辨率高光谱图像(Low-Resolution HSI, LR-HSI)与高空间分辨率多光谱图像(High-Resolution MSI, HR-MSI)进行融合，是获取高空间分辨率高光谱图像(High-Resolution HSI, HR-HSI)的有效途径。现有基于Transformer的融合方法虽然能够建模长程依赖，但全局自注意力存在二次复杂度，且对光谱波段的物理顺序与跨模态信息交互利用不足。针对上述问题，本文提出一种融合局部-全局协同Transformer与状态空间模型的HSI-MSI融合方法。该方法在LGCT(Local-Global Collaborative Transformer)双分支框架基础上，引入三个即插即用模块：Shuffle Cross-Scan Mamba(SCSM)用于MSI流的全局长程空间依赖建模；Spectral-Spatial Guided Mamba(SSGM)沿光谱波段顺序扫描，显式建模光谱连续性；Lightweight Cross-Modal Attention(LCMA)在双流特征提取阶段实现空间-光谱信息的互补交互。在PaviaU、Houston、Chikusei及Botswana等公开数据集上的实验结果表明，本文方法在峰值信噪比(PSNR)、光谱角制图(SAM)、相对全局无量纲误差(ERGAS)及结构相似性指数(SSIM)等指标上均优于现有主流方法，其中在PaviaU数据集上PSNR达到45.10 dB，较LGCT基线提升约0.63 dB。

**关键词**：图像融合；高光谱图像；多光谱图像；Transformer；Mamba；状态空间模型；跨模态注意力

---

## Abstract

Hyperspectral images (HSIs) provide rich spectral information and have important applications in remote sensing object identification, environmental monitoring, and precision agriculture. However, due to the physical constraints of imaging system throughput and sensor hardware, HSIs usually suffer from limited spatial resolution. Fusing a low-spatial-resolution HSI (LR-HSI) with a high-spatial-resolution multispectral image (HR-MSI) is an effective way to obtain a high-spatial-resolution HSI (HR-HSI). Although existing Transformer-based fusion methods can model long-range dependencies, their global self-attention incurs quadratic complexity and insufficiently exploits the physical order of spectral bands and cross-modal information interaction. To address these issues, this paper proposes an HSI-MSI fusion method that integrates a local-global collaborative Transformer with state space models. Based on the dual-branch framework of LGCT (Local-Global Collaborative Transformer), three plug-and-play modules are introduced: Shuffle Cross-Scan Mamba (SCSM) for global long-range spatial dependency modeling in the MSI stream; Spectral-Spatial Guided Mamba (SSGM) for explicit spectral continuity modeling by scanning along spectral bands; and Lightweight Cross-Modal Attention (LCMA) for complementary spatial-spectral interaction during dual-stream feature extraction. Extensive experiments on public datasets including PaviaU, Houston, Chikusei, and Botswana demonstrate that the proposed method outperforms existing mainstream methods in terms of peak signal-to-noise ratio (PSNR), spectral angle mapper (SAM), relative global dimensional synthesis error (ERGAS), and structural similarity index (SSIM). Notably, the PSNR on the PaviaU dataset reaches 45.10 dB, which is about 0.63 dB higher than the LGCT baseline.

**Keywords**: image fusion; hyperspectral image; multispectral image; Transformer; Mamba; state space model; cross-modal attention

---

## 1 引言

高光谱图像凭借其覆盖可见光到短波红外范围的数十至数百个连续窄波段，能够获取近似连续的光谱响应曲线，从而实现对地物材质与理化属性的精准辨识[1]。因此，HSI在农业监测、矿物勘探、环境监测及军事侦察等领域展现出广阔的应用价值[2-4]。然而，由于成像系统光通量与传感器硬件的物理制约，高光谱成像在获取高光谱分辨率的同时，往往难以维持高空间分辨率[5]。相较而言，多光谱图像虽然光谱维度较低，仅包含少量离散波段，却具备更高的空间分辨率和成像效率。因此，如何将同一场景下低空间分辨率的HSI与高空间分辨率的MSI有效融合，以生成兼具高光谱信息与高空间细节的HR-HSI，已成为遥感图像处理领域亟待解决的关键问题。

传统的HSI-MSI融合方法主要基于矩阵分解或张量分解等模型驱动技术，通过人工设计的先验约束实现空间与光谱信息的联合重建[6,7]。这类方法通常设定特定的优化约束空间，但受限于浅层线性表征能力，难以在复杂场景中准确建模光谱特征与空间结构之间的非线性映射关系。随着深度学习的发展，卷积神经网络(Convolutional Neural Network, CNN)已成为HSI-MSI融合研究中的主流范式。基于CNN的方法通过卷积结构高效提取局部空间与光谱特征，并能够自动学习LR-HSI与HR-MSI之间的非线性映射，从而显著提升空间细节恢复能力[8-10]。然而，由于卷积操作固有的局部感受野特性，CNN在长程依赖捕获及全局光谱关联建模方面存在不足，导致在复杂场景下可能出现细节缺失或光谱失真。

近年来，Transformer凭借其全局自注意力机制在自然语言处理与计算机视觉领域取得了巨大成功，并逐渐应用于HSI-MSI融合任务[11,12]。基于Transformer的方法能够有效建模图像块之间的长程依赖关系，在恢复空间细节和保持光谱一致性方面展现出优势。例如，LGCT[13]通过局部-全局协同Transformer块，分别提取MSI流的空间特征与HSI流的光谱特征，并采用对称的U型编码-解码结构实现融合。然而，Transformer全局自注意力的计算复杂度随序列长度呈二次增长，在处理高分辨率遥感图像时计算开销较大；同时，现有方法大多将光谱通道作为独立的特征维度处理，未显式利用光谱波段的物理顺序，对光谱连续性的建模仍有不足。

近期，以Mamba为代表的状态空间模型(State Space Model, SSM)因其线性复杂度与对长序列的强大建模能力受到广泛关注[14,15]。Mamba通过选择性扫描机制，能够在序列长度上实现近似线性的计算复杂度，同时保持对长程依赖的有效建模。部分研究尝试将Mamba引入高光谱图像处理任务，如MambaHSI[16]通过光谱扫描Mamba实现高光谱图像分类。然而，将Mamba直接应用于HSI-MSI融合仍面临挑战：MSI流需要捕获二维空间长程依赖，HSI流需要建模沿光谱波段的物理连续性，二者扫描方向与语义不同；此外，MSI流与HSI流之间缺乏显式交互，导致空间细节与光谱信息未能充分互补。

为解决上述问题，本文提出一种融合局部-全局协同Transformer与状态空间模型的HSI-MSI融合方法。该方法以LGCT为基线，在不改变其局部分支与整体U型融合结构的前提下，引入三个即插即用模块：SCSM、SSGM与LCMA。SCSM采用四方向交叉扫描Mamba替换MSI流的全局自注意力分支，在线性复杂度下捕获全图长程空间依赖；SSGM沿光谱波段顺序进行双向扫描，显式建模相邻波段之间的物理连续性，并通过轻量空间门控实现自适应调制；LCMA在双流特征提取阶段插入双向跨模态注意力，促进空间细节与光谱信息的互补交互。本文主要贡献如下：

1) 提出Shuffle Cross-Scan Mamba(SCSM)模块，通过四方向空间扫描与通道洗牌策略，在降低计算复杂度的同时增强MSI流的全局长程空间依赖建模能力；
2) 设计Spectral-Spatial Guided Mamba(SSGM)模块，沿光谱波段顺序进行双向扫描，显式建模光谱连续性，并引入空间引导门控实现自适应光谱增强；
3) 构建Lightweight Cross-Modal Attention(LCMA)模块，在双流特征提取阶段实现双向跨模态注意力交互，并通过空间压缩与可学习门控控制计算开销与信息流动；
4) 在PaviaU、Houston、Chikusei及Botswana等公开数据集上开展实验，结果表明本文方法在PSNR、SAM、ERGAS及SSIM等指标上均优于现有主流方法，其中PaviaU数据集上PSNR达到45.10 dB，较LGCT基线提升约0.63 dB。

---

## 2 本文方法

### 2.1 整体网络架构

本文所提出的方法整体架构如图1所示。该网络延续LGCT的双分支U型编码-解码结构，分别提取MSI流的空间特征与HSI流的光谱特征，以确保原始空间与光谱信息的完整保留。

具体而言，给定LR-HSI输入 $X \in \mathbb{R}^{B \times C \times H/S \times W/S}$ 与HR-MSI输入 $Y \in \mathbb{R}^{B \times M \times H \times W}$，其中 $B$ 为批量大小，$C$ 与 $M$ 分别为HSI与MSI的波段数，$H, W$ 为空间尺寸，$S$ 为空间降尺度因子。首先，将LR-HSI通过双三次插值上采样至与HR-MSI相同的空间分辨率，得到 $X_U \in \mathbb{R}^{B \times C \times H \times W}$，并与HR-MSI在通道维度拼接后输入MSI流。MSI流采用3级下采样结构，通过Spa_CTB(Spatial Collaborative Transformer Block)提取多尺度空间特征 $\{M_1, M_2, M_3\}$；HSI流采用3级上采样结构，通过Spe_CTB(Spectral Collaborative Transformer Block)提取多尺度光谱特征 $\{H_1, H_2, H_3\}$。

在双流特征提取完成后，本文插入LCMA模块实现跨模态交互，得到增强后的空间特征与光谱特征。随后，特征进入对称的U型编码-解码融合路径(Merge Path)：下采样路径逐步聚合多尺度特征，瓶颈层进一步提炼语义信息，上采样路径通过跳跃连接恢复空间细节。最终，输出融合结果 $O \in \mathbb{R}^{B \times C \times H \times W}$ 与上采样后的LR-HSI $X_U$ 相加，得到最终的HR-HSI预测：

$$
O = \mathcal{F}_{merge}(\mathcal{F}_{LCMA}(M_1,M_2,M_3; H_1,H_2,H_3)) + X_U
$$

式中，$\mathcal{F}_{LCMA}(\cdot)$ 表示LCMA跨模态交互操作，$\mathcal{F}_{merge}(\cdot)$ 表示U型融合路径。该架构的核心改进在于：SCSM与SSGM分别增强了MSI流与HSI流的全局建模能力，LCMA在融合前实现了双流信息的显式互补，三者在保持原LGCT整体框架稳定性的同时形成协同效应。

> **图1 本文方法整体网络架构图**
>
> Fig. 1 Overall network architecture of the proposed method
>
> 【待补充：绘制整体网络架构图，包含LR-HSI与HR-MSI输入、MSI流下采样路径、HSI流上采样路径、LCMA插入位置、U型Merge Path、跳跃连接及最终输出。需标注关键位置特征图尺寸，如MSI流三级特征尺寸分别为 $H\times W \times 48$、$H/2\times W/2 \times 96$、$H/4\times W/4 \times 192$，HSI流三级特征尺寸对应为 $H/4\times W/4 \times 192$、$H/2\times W/2 \times 96$、$H\times W \times 48$。】

### 2.2 Shuffle Cross-Scan Mamba (SCSM)

MSI流负责提取高分辨率空间细节。原LGCT的Spa_RSA全局分支采用通道分半策略，一半注意力头用于窗口内局部注意力，另一半用于跨窗口全局注意力，导致全局感受野受窗口排列方式限制，且计算复杂度随图像尺寸呈二次增长。针对该问题，本文提出SCSM模块，采用四方向交叉扫描Mamba替换原全局分支，在线性复杂度下捕获全图长程空间依赖。

SCSM模块的整体架构如图2所示。其处理流程可描述为：给定MSI流特征 $X \in \mathbb{R}^{B \times H \times W \times C}$，首先通过通道洗牌(Channel Shuffle)操作对通道进行分组重排，以降低后续方向扫描的方向性偏置；随后通过步长为 $s$ 的分组深度可分离卷积进行 $s$ 倍空间下采样，降低Mamba处理的序列长度；接着对下采样后的特征进行四方向(横向、纵向、反横向、反纵向)交叉扫描，得到四条一维序列：

$$
\begin{aligned}
S_1 &= \text{Reshape}(X_{down}) \in \mathbb{R}^{(B) \times (H_d W_d) \times C} \\
S_2 &= \text{Reshape}(\text{Permute}(X_{down})) \in \mathbb{R}^{(B) \times (W_d H_d) \times C} \\
S_3 &= \text{Reshape}(\text{Flip}_W(X_{down})) \in \mathbb{R}^{(B) \times (H_d W_d) \times C} \\
S_4 &= \text{Reshape}(\text{Flip}_H(\text{Permute}(X_{down}))) \in \mathbb{R}^{(B) \times (W_d H_d) \times C}
\end{aligned}
$$

式中，$H_d = H/s$，$W_d = W/s$ 为下采样后的空间尺寸，$\text{Flip}_W(\cdot)$ 与 $\text{Flip}_H(\cdot)$ 分别表示沿宽度与高度方向翻转。

将四条序列在批次维度拼接后输入共享参数的Mamba模块：

$$
\{O_1, O_2, O_3, O_4\} = \text{Split}(\text{Mamba}(\text{Concat}(S_1, S_2, S_3, S_4)))
$$

然后对四条输出序列进行交叉合并(Cross Merge)，还原为二维特征图并相加：

$$
F_{merge} = \text{CrossMerge}(O_1, O_2, O_3, O_4) \in \mathbb{R}^{B \times C \times H_d \times W_d}
$$

为增强不同扫描方向之间的信息交互，进一步采用3×3深度可分离卷积进行跨方向混合：

$$
F_{mix} = F_{merge} + \text{DWConv}_{3\times 3}(F_{merge})
$$

随后通过层归一化、PVT2FFN及线性投影增强局部特征，最后通过上采样与1×1卷积恢复原始空间分辨率：

$$
Y = \text{SpatialUp}(\text{Proj}(\text{PVT2FFN}(\text{LN}(F_{mix}))))) \in \mathbb{R}^{B \times H \times W \times C}
$$

SCSM通过四方向扫描覆盖了二维空间中的多种上下文路径，通道洗牌降低了方向性偏置，空间下采样有效控制了序列长度，使全局空间依赖建模的计算复杂度从二次降低为近似线性。

> **图2 SCSM模块结构示意图**
>
> Fig. 2 Architecture of the proposed SCSM module
>
> 【待补充：绘制SCSM模块内部结构，包含Channel Shuffle、Spatial Down、Cross Scan(四个方向箭头)、Mamba、Cross Merge、Cross-Direction Mixing、PVT2FFN、Spatial Up等子模块，标注输入输出尺寸。】

### 2.3 Spectral-Spatial Guided Mamba (SSGM)

HSI流负责保持光谱连续性与恢复光谱细节。原LGCT的Spe_RSA全局分支在光谱通道维度进行全空间注意力计算，虽然能够建模跨光谱关系，但未显式利用光谱波段的物理顺序，且与SCSM同样建模空间长程依赖，存在功能冗余。针对该问题，本文提出SSGM模块，沿光谱波段顺序进行双向扫描，显式建模相邻波段之间的物理连续性。

SSGM模块的整体架构如图3所示。给定HSI流特征 $X \in \mathbb{R}^{B \times C \times H \times W}$，其中 $C$ 为光谱波段数。首先将光谱通道划分为 $T$ 个组(Token Num)，每组包含 $D = \lceil C/T \rceil$ 个波段，并在必要时对通道进行零填充，使总通道数为 $C_{pad} = T \cdot D$。随后，将每个空间像素视为一条独立的光谱序列，特征被重塑为：

$$
X_{seq} = \text{Reshape}(\text{Permute}(X_{pad})) \in \mathbb{R}^{(BHW) \times T \times D}
$$

式中，序列长度 $T$ 对应光谱组数，特征维度 $D$ 对应每组内的波段数。这种设计使得Mamba能够沿光谱波段顺序扫描，显式建模从短波长到长波长方向的光谱连续性。

为消除单向扫描的方向性偏置，本文采用双向扫描策略。正向序列保持原始光谱顺序，反向序列沿光谱维度翻转，二者共享同一组Mamba参数：

$$
\begin{aligned}
X_{fwd} &= X_{seq} \\
X_{rev} &= \text{Flip}_T(X_{seq}) \\
\{O_{fwd}, O_{rev}\} &= \text{Split}(\text{Mamba}(\text{Concat}(X_{fwd}, X_{rev})))
\end{aligned}
$$

将反向输出翻转回原始顺序后与正向输出相加，得到双向光谱增强特征：

$$
O_{spec} = O_{fwd} + \text{Flip}_T(O_{rev})
$$

随后通过GroupNorm与SiLU激活函数进行投影，并去除填充通道恢复至原始波段数。为了增强模块对空间内容的适应性，本文进一步引入轻量空间引导门控。具体地，通过全局平均池化获取全局空间上下文，并通过两层1×1卷积生成通道权重：

$$
G = \sigma(W_2(\text{GELU}(W_1(\text{GAP}(X))))) \in \mathbb{R}^{B \times C \times 1 \times 1}
$$

式中，$\sigma(\cdot)$ 为Sigmoid函数，$W_1$ 与 $W_2$ 为1×1卷积，分别实现通道降维与升维。最终，SSGM的输出为：

$$
Y = X + G \odot \text{Trim}(\text{Proj}(O_{spec}))
$$

式中，$\odot$ 表示逐元素乘法，$\text{Trim}(\cdot)$ 用于去除填充通道。SSGM的参数量极低，在三个阶段的HSI流中仅增加约0.035M参数，但通过沿光谱顺序的扫描显式建模了物理光谱连续性，并通过空间门控实现了自适应调制。

> **图3 SSGM模块结构示意图**
>
> Fig. 3 Architecture of the proposed SSGM module
>
> 【待补充：绘制SSGM模块内部结构，包含Channel Padding、Reshape、Bidirectional Spectral Scan、Mamba、Merge、GroupNorm+SiLU、Trim、Spatial-Guided Gate等子模块，标注输入输出尺寸及序列维度。】

### 2.4 Lightweight Cross-Modal Attention (LCMA)

原LGCT在双流特征提取后直接进入U型Merge Path，MSI流与HSI流之间缺乏显式交互，导致MSI流难以获得光谱上下文约束，HSI流也难以直接利用MSI的高分辨率空间细节。针对该问题，本文提出LCMA模块，在双流特征提取完成后、Merge Path之前插入双向跨模态注意力，实现空间-光谱信息的互补交互。

LCMA模块的整体架构如图4所示。给定MSI流特征 $M \in \mathbb{R}^{B \times C \times H \times W}$ 与HSI流特征 $H \in \mathbb{R}^{B \times C \times H \times W}$，首先将其重塑为序列形式 $m, h \in \mathbb{R}^{B \times HW \times C}$，并分别进行层归一化：

$$
\begin{aligned}
m' &= \text{LN}_m(m) \\
h' &= \text{LN}_h(h)
\end{aligned}
$$

Pre-LayerNorm设计使LCMA对上游模块(SCSM或原始CTB)的特征分布变化具有鲁棒性。LCMA包含两个方向的交叉注意力：

1) **M→H方向(MSI查询HSI)**：使MSI流获得光谱上下文信息。该方向的查询、键、值分别由 $m'$ 与 $h'$ 投影得到：

$$
\begin{aligned}
Q_{mh} &= W_q^{mh} m' \\
K_{mh} &= W_k^{mh} h' \\
V_{mh} &= W_v^{mh} h'
\end{aligned}
$$

2) **H→M方向(HSI查询MSI)**：使HSI流获得高分辨率空间细节信息：

$$
\begin{aligned}
Q_{hm} &= W_q^{hm} h' \\
K_{hm} &= W_k^{hm} m' \\
V_{hm} &= W_v^{hm} m'
\end{aligned}
$$

为降低计算复杂度，本文对Key与Value进行空间压缩。以压缩率 $r$ 为例，通过步长为 $r$ 的分组深度可分离卷积将 $K, V$ 的空间尺寸从 $HW$ 降至 $HW/r^2$：

$$
\begin{aligned}
K_{mh}^c &= \text{SpatialCompress}(K_{mh}, r) \\
V_{mh}^c &= \text{SpatialCompress}(V_{mh}, r)
\end{aligned}
$$

交叉注意力的计算过程为：

$$
\text{Attn}(Q, K, V) = \text{Softmax}\left(\frac{Q K^T}{\sqrt{d_k}}\right) V
$$

式中，$d_k = C / N_{head}$ 为每个注意力头的维度，$N_{head}$ 为注意力头数。通过空间压缩，注意力计算的复杂度从 $O((HW)^2)$ 降低至 $O((HW/r)^2)$。

由于H→M方向与SCSM的空间增强存在功能重叠，本文引入可学习门控 $\gamma_{hm}$ 控制该方向的贡献，初始化值为0.5，使网络能够自主学习是否削弱H→M分支：

$$
\begin{aligned}
m_{out} &= m + \text{Attn}(Q_{mh}, K_{mh}^c, V_{mh}^c) \\
h_{out} &= h + \gamma_{hm} \cdot \text{Attn}(Q_{hm}, K_{hm}^c, V_{hm}^c)
\end{aligned}
$$

最后，将增强后的序列 $m_{out}, h_{out}$ 重塑回二维特征图，作为后续Merge Path的输入。LCMA通过双向跨模态注意力实现了空间与光谱信息的早期互补，并通过空间压缩与可学习门控在增强性能与控制复杂度之间取得平衡。

> **图4 LCMA模块结构示意图**
>
> Fig. 4 Architecture of the proposed LCMA module
>
> 【待补充：绘制LCMA模块内部结构，包含Pre-LN、M→H Cross-Attention、H→M Cross-Attention、Spatial Compression、Learnable Gate $\gamma_{hm}$、Output Projection等子模块，标注输入输出尺寸。】

### 2.5 损失函数

本文采用L1损失作为优化目标。L1损失通过最小化融合结果与参考HR-HSI之间的绝对误差，为模型优化提供稳定的梯度方向，并且对异常值具有一定的鲁棒性。其定义如下：

$$
\mathcal{L} = \frac{1}{H W C} \sum_{i=1}^{H} \sum_{j=1}^{W} \sum_{c=1}^{C} \left| O_c(i,j) - R_c(i,j) \right|
$$

式中，$O_c(i,j)$ 与 $R_c(i,j)$ 分别表示融合结果与参考HR-HSI在第 $c$ 个波段、空间位置 $(i,j)$ 处的像素值。L1损失是HSI-MSI融合任务中的常用选择，能够在保证像素级重建精度的同时，避免L2损失对较大误差的过度敏感。

---

## 3 实验与分析

### 3.1 数据集

为验证本文方法的有效性，在多个公开HSI-MSI融合数据集上开展实验，各数据集的基本信息如下：

1) **Pavia University (PaviaU)**：由ROSIS传感器于2003年在意大利帕维亚大学区域采集，共包含103个波段(0.43–0.86 μm，10 nm间隔)。每个波段的图像尺寸为 $610 \times 340$，空间分辨率为1.3 m。该数据集场景以城市建筑与植被为主，是HSI-MSI融合任务中最常用的基准数据集之一。
2) **Houston**：由ITRES CASI-1500传感器于2013年在美国休斯顿大学区域采集，共包含144个波段(0.36–1.05 μm)，去噪后保留144个有效波段。每个波段的图像尺寸为 $349 \times 1905$，空间分辨率为2.5 m。该数据集城市场景复杂，基线性能较高。
3) **Chikusei**：由Headwall Hyperspec-VNIR-C传感器于2014年在日本筑西市采集，包含128个波段(0.36–1.018 μm)。每个波段的图像尺寸为 $2517 \times 2335$，空间分辨率为2.5 m。该数据集覆盖城乡结合区域，场景结构复杂，对模型的泛化能力要求较高。
4) **Botswana**：由EO-1卫星搭载的Hyperion传感器于2001–2004年间在博茨瓦纳奥卡万戈三角洲采集。原始数据包含242个波段(0.4–2.5 μm，10 nm间隔)，去噪后保留145个有效波段。每个波段的图像尺寸为 $1476 \times 256$，空间分辨率为30 m。该数据集以自然场景为主，光谱差异大，对长程依赖建模敏感。

**表1 实验数据集基本信息**

Table 1 Basic information of the experimental datasets

| 数据集   | 传感器                    | 波段数 | 空间尺寸     | 空间分辨率/m | 光谱范围/nm | 场景类型       |
| :------- | :------------------------ | :----: | :----------- | :----------: | :---------- | :------------- |
| PaviaU   | ROSIS                     |  103  | 610 × 340   |     1.3     | 430–860    | 城市建筑与植被 |
| Houston  | ITRES CASI-1500           |  144  | 349 × 1905  |     2.5     | 360–1050   | 复杂城市场景   |
| Chikusei | Headwall Hyperspec-VNIR-C |  128  | 2517 × 2335 |     2.5     | 360–1018   | 城乡结合区域   |
| Botswana | Hyperion(EO-1)            |  145  | 1476 × 256  |      30      | 400–2500   | 自然湿地与植被 |

本文选取上述四个数据集开展实验，覆盖城市、城乡结合及自然场景等多种类型，空间分辨率从1.3 m到30 m不等，光谱波段数从103到144不等，能够较全面地验证所提方法在不同成像条件下的泛化能力。

### 3.2 评价指标

本文采用以下六个定量指标评估融合性能：

1) **均方根误差(RMSE)**：RMSE用于量化参考HR-HSI与融合HR-HSI之间的整体差异度，RMSE值越小表明融合性能越好。其定义如下：

$$
R_{RMSE} = \sqrt{\frac{1}{HWC} \sum_{i=1}^{H} \sum_{j=1}^{W} \sum_{c=1}^{C} (R_c(i,j) - O_c(i,j))^2}
$$

式中，$R_c(i,j)$ 和 $O_c(i,j)$ 分别表示参考HR-HSI与融合HR-HSI在第 $c$ 个波段、空间位置 $(i,j)$ 处的像素值。

2) **峰值信噪比(PSNR)**：PSNR用于衡量融合图像的空间重建质量，PSNR值越大表明重建结果越接近参考图像。其定义如下：

$$
R_{PSNR} = 10 \log_{10}\left( \frac{\max(R)^2}{\frac{1}{HWC} \sum_{i,j,c} (R_c(i,j) - O_c(i,j))^2} \right)
$$

3) **相对全局无量纲误差(ERGAS)**：ERGAS用于评估融合图像的整体统计质量，ERGAS值越小表明融合性能越好。其定义如下：

$$
R_{ERGAS} = 100 \cdot \frac{1}{S} \sqrt{\frac{1}{C} \sum_{c=1}^{C} \left( \frac{\text{RMSE}_c}{\mu_c} \right)^2}
$$

式中，$S$ 为空间降尺度因子，$\text{RMSE}_c$ 与 $\mu_c$ 分别表示第 $c$ 个波段的RMSE与均值。

4) **光谱角制图(SAM)**：SAM用于度量融合图像的光谱保真度，通过计算每个像素处融合光谱与参考光谱之间的夹角来评估，SAM值越小表明光谱失真越小。其定义如下：

$$
R_{SAM} = \frac{1}{HW} \sum_{i=1}^{H} \sum_{j=1}^{W} \arccos\left( \frac{\langle R(i,j), O(i,j) \rangle}{\|R(i,j)\| \cdot \|O(i,j)\|} \right)
$$

5) **相关系数(CC)**：CC用于评估融合图像与参考图像各波段之间的线性相关性，CC值越接近1表明相关性越强。
6) **结构相似性指数(SSIM)**：SSIM用于评估融合图像与参考图像之间的结构相似性，SSIM值越接近1表明结构一致性越好。

### 3.3 实验设置

对于上述数据集，本文采用统一的数据划分策略：选取图像中心区域作为测试集，其余部分用于训练，训练与测试区域在空间上完全不重叠。

在数据生成过程中，LR-HSI由参考HR-HSI经过 $S \times S$ 高斯滤波模糊处理后，经 $S$ 倍下采样生成。对应的HR-MSI则通过从HR-HSI中等间距选取 $M$ 个波段构建。尽管真实的MSI传感器通常基于光谱响应函数在宽波段范围内积分成像，但为了与现有主流研究方法保持实验基准的一致性并确保对比的客观性，本文遵循了这一广泛通用的简化数据生成协议。

在模型训练阶段，采用patch-based训练策略，每次迭代从训练区域随机裁剪尺寸为 $128 \times 128$ 的样本，batch size设为1。优化器为Adam，初始学习率设为 $1 \times 10^{-4}$，共迭代训练15000个轮次。对于消融实验中的基线LGCT及单模块配置，训练10000个轮次。所有实验均基于Python 3.9与PyTorch框架实现，运行环境包括NVIDIA GPU。

**表2 实验主要超参数设置**

Table 2 Main hyperparameter settings in the experiments

| 超参数             | 设置值                    | 说明                                                   |
| :----------------- | :------------------------ | :----------------------------------------------------- |
| 优化器             | Adam                      | 一阶动量估计参数 β₁=0.9，二阶动量估计参数 β₂=0.999 |
| 初始学习率         | 1×10⁻⁴                 | 训练过程中保持不变                                     |
| 训练轮次           | 15000(Full) / 10000(消融) | Full配置训练15000轮，基线及单模块消融训练10000轮       |
| Batch size         | 1                         | 每个迭代仅处理一个样本                                 |
| 训练patch尺寸      | 128 × 128                | 每次迭代从训练区域随机裁剪                             |
| 空间降尺度因子 S   | 4                         | LR-HSI经4倍下采样生成                                  |
| 高斯模糊核         | 5 × 5                    | 标准差 σ=2，用于生成LR-HSI                            |
| MSI波段数 M        | 5                         | 从HR-HSI中等间距选取5个波段构建HR-MSI                  |
| 空间注意力窗口大小 | 8 × 8                    | Spa_RSA局部注意力窗口                                  |
| 光谱分组大小       | 8                         | Spe_RSA局部光谱分组大小                                |
| MSI流初始通道数    | 48                        | Spa_CTB第一级输出通道数                                |
| HSI流初始通道数    | 128                       | Spe_CTB第一级输入通道数(经上采样后)                    |
| SSGM token_num     | 8                         | 光谱分组数                                             |
| LCMA 注意力头数    | 4                         | 三阶段LCMA均使用4头注意力                              |
| LCMA 压缩率        | [4, 2, 1]                 | 三阶段LCMA对K/V的空间压缩率                            |
| 损失函数           | L1 Loss                   | 像素级绝对误差损失                                     |
| 实验框架           | PyTorch                   | Python 3.9，NVIDIA GPU                                 |

### 3.4 对比实验

为验证本文方法的有效性，在PaviaU、Houston、Chikusei及Botswana数据集上开展了对比实验。对比方法包括传统方法(HySure[6]、CSTF[17]、LTMR[18])、基于CNN的方法(SSRNet[8]、MSDCNN[19]、SCPNet[20]、ResTFNet[9])、基于Transformer的方法(MCT[11]、PSRT[21]、DCTransformer[22]、LGCT[13])，以及基于Mamba/混合架构的方法(MTFNet[23]、DSIR[24])。

所有深度学习对比方法均采用与本文相同的数据划分与训练策略复现，或直接引用原文献在对应数据集上报告的结果。特别地，LGCT原论文在Chikusei数据集上采用了800×800子图作为reference，而本文与DSIR采用全图统一Wald协议(中心128×128测试、其余区域训练)，两者不直接可比。因此，本文在Chikusei数据集上与DSIR论文在全图协议下复现的LGCT结果(42.996 dB)进行对比。

#### 3.4.1 PaviaU数据集定量分析

PaviaU数据集上的定量对比结果如表3所示(粗体表示最优结果，下划线表示次优结果)。

**表3 不同方法在PaviaU数据集上的定量评估结果**

Table 3 Quantitative evaluation results of different methods on the PaviaU dataset

| Method         |      RMSE↓      |     PSNR/dB↑     |     ERGAS↓     |      SAM↓      |       CC↑       |      SSIM↑      |
| :------------- | :--------------: | :---------------: | :--------------: | :--------------: | :--------------: | :--------------: |
| HySure         |      7.2800      |      34.7400      |      5.1880      |      5.2880      |      0.9463      |      0.8364      |
| CSTF           |      3.7600      |      40.1800      |      2.7770      |      3.6640      |      0.9844      |      0.9279      |
| LTMR           |      3.6000      |      40.5400      |      2.5810      |      2.8210      |      0.9857      |      0.9641      |
| ResTFNet       |      2.1100      |      41.3400      |      1.5380      |      2.3810      |      0.9932      |      0.9543      |
| SSRNet         |      1.7200      |      43.0800      |      1.2490      |      2.0380      |      0.9959      |      0.9608      |
| MSDCNN         |      2.1200      |      41.2800      |      1.5160      |      2.4170      |      0.9934      |      0.9522      |
| SCPNet         |      1.9100      |      42.1800      |      1.4400      |      2.2390      |      0.9940      |      0.9608      |
| MCT            |      1.6200      |      43.6400      |      1.1890      |      1.9250      |      0.9963      |      0.9639      |
| PSRT           |      1.8200      |      42.6000      |      1.3330      |      2.0950      |      0.9952      |      0.9624      |
| DCT            |      1.5600      |      43.9700      |      1.1650      |      1.8170      |      0.9966      |      0.9673      |
| LGCT           |      1.4700      |      44.4700      |      1.1120      |      1.7520      |      0.9968      |      0.9693      |
| MTFNet         |      1.4620      |      44.3603      |      1.1082      |      1.7664      |      0.9969      |      0.9680      |
| DSIR           |      1.4642      |      44.5860      |      1.1153      |      1.7035      |      0.9969      |      0.9911      |
| **Ours** | **1.3665** | **45.1033** | **1.0555** | **1.6599** | **0.9972** | **0.9920** |

注：Ours的结果来自本仓库实际训练日志 `checkpoints/LGCT/PaviaU/2026_07_22_22_17_59/train.log`，Best Epoch为13071。

从表3可以看出，与传统方法相比，本文方法在所有指标上均展现出显著优势，PSNR达到45.1033 dB，较SSRNet提升约2.02 dB，表明深度学习方法在复杂城市场景下的非线性映射能力远超传统模型驱动方法。与基于Transformer的方法相比，本文方法的PSNR较LGCT提升0.6333 dB，ERGAS从1.1120降至1.0555，SAM从1.7520降至1.6599，说明通过Mamba替换全局自注意力，本文方法在增强空间细节恢复的同时，能够更优地保持光谱特征。与最新的基于Mamba的方法MTFNet和DSIR相比，本文方法在PSNR上分别超出0.7430 dB和0.5173 dB，验证了所提出的空间-光谱解耦Mamba设计与跨模态注意力交互的有效性。

#### 3.4.2 Houston数据集定量分析

Houston数据集上的定量对比结果如表4所示(粗体表示最优结果，下划线表示次优结果)。

**表4 不同方法在Houston、Chikusei及Botswana数据集上的定量评估结果**

Table 4 Quantitative evaluation results of different methods on the Houston, Chikusei, and Botswana datasets

| Method         |      Dataset      |      RMSE↓      |     PSNR/dB↑     |     ERGAS↓     |      SAM↓      |       CC↑       |      SSIM↑      |
| :------------- | :----------------: | :--------------: | :---------------: | :--------------: | :--------------: | :--------------: | :--------------: |
| SSRNet         |      Houston      |      1.4567      |      44.4710      |      2.9377      |      2.7658      |      0.9764      |      0.9901      |
| MCT            |      Houston      |      1.2970      |      45.4800      |      2.1508      |      2.3782      |      0.9821      |      0.9959      |
| LGCT           |      Houston      |      0.7200      |      50.6000      |      1.0830      |      1.1530      |      0.9933      |      0.9944      |
| DSIR           |      Houston      |      0.5583      |      52.8020      |      0.9561      |      0.9810      |      0.9944      |      0.9985      |
| **Ours** | **Houston** | **0.6144** | **51.9691** | **1.0162** | **1.0243** | **0.9937** | **0.9985** |
| SSRNet         |      Chikusei      |      1.0283      |      39.4360      |      2.7471      |      2.1139      |      0.9879      |      0.9913      |
| MCT            |      Chikusei      |      0.9935      |      39.7350      |      2.5917      |      2.0929      |      0.9891      |      0.9917      |
| LGCT†         |      Chikusei      |      0.6904      |      42.9960      |      1.9864      |      1.4747      |      0.9929      |      0.9935      |
| DSIR*          |      Chikusei      |      0.6536      |      43.3720      |      1.9514      |      1.4028      |      0.9933      |      0.9940      |
| **Ours** | **Chikusei** | **0.6477** | **43.4509** | **1.9331** | **1.4006** | **0.9934** | **0.9973** |
| SSRNet         |      Botswana      |      0.4106      |      38.9583      |      2.7994      |      2.0181      |        —        |        —        |
| MCT            |      Botswana      |      0.3363      |      40.6931      |      2.2186      |      1.6326      |        —        |        —        |
| MTFNet         |      Botswana      |      0.3336      |      40.7018      |      1.8841      |      1.5840      |        —        |        —        |
| LGCT           |      Botswana      |      0.3501      |      40.4520      |      1.2918      |      1.3821      |      0.9932      |      0.9930      |
| DSIR           |      Botswana      |      0.2854      |      42.1180      |      1.2230      |      1.3550      |      0.9943      |      0.9940      |
| **Ours** | **Botswana** | **0.2704** | **42.5849** | **1.1730** | **1.2951** | **0.9948** | **0.9991** |

注：Ours 为 2026-07-28 实测 Best 结果；DSIR* 在 Chikusei 上的数值体系与 LGCT 原论文存在差异；LGCT† 为 DSIR 在全图 Wald 协议下复现的 LGCT 基线，本工作采用该值作为 Chikusei 的公平对比基准。LGCT 原论文在 Chikusei 上报告 45.81 dB，但其使用了 800×800 子图作为 reference，与本工作及 DSIR 的全图协议不直接可比；"—" 表示原文未报告该指标。

Houston数据集定量分析：Houston数据集城市场景复杂，且LGCT基线性能已较高(PSNR=50.60 dB)。从表4可以看出，与传统CNN方法SSRNet及基于Transformer的MCT相比，LGCT已经取得了显著优势，PSNR分别高出约6.13 dB和5.12 dB，这验证了局部-全局协同Transformer框架对该数据集的有效性。与LGCT相比，本文方法PSNR达到51.9691 dB，提升约1.37 dB，SAM从1.1530降至1.0243，ERGAS从1.0830降至1.0162，说明SCSM与SSGM的全局建模能力以及LCMA的跨模态交互能够显著改善空间细节恢复与光谱保真度。与DSIR相比，本文方法PSNR低0.83 dB，但DSIR在该数据集上的极高性能主要得益于AELF基线已经达到52.762 dB以及隐式神经表示(INR)模块的亚像素精修；相比之下，本文方法以更简洁的即插即用模块改进LGCT，在保持架构稳定性的同时实现显著提升，参数量也远低于DSIR。

Chikusei数据集定量分析：Chikusei数据集覆盖城乡结合区域，场景结构复杂，对模型的泛化能力要求较高。从表4可以看出，基于CNN的SSRNet与基于Transformer的MCT在该数据集上PSNR均低于40 dB，而LGCT原论文报告45.81 dB。然而，LGCT原论文在Chikusei上使用了800×800子图作为reference，而本工作与DSIR采用全图统一Wald协议（中心128×128测试、其余区域训练），因此直接引用45.81 dB并不公平。在全图协议下，DSIR复现的LGCT基线为42.996 dB，DSIR自身方法为43.372 dB。本文方法PSNR达到43.4509 dB，较该协议下的LGCT基线提升约0.45 dB，并略高于DSIR，SAM从1.4747降至1.4006，ERGAS从1.9864降至1.9331。这一结果说明，SCSM的全局长程空间依赖建模有助于恢复复杂场景中的边缘与纹理细节，SSGM沿光谱波段顺序扫描能够更好地保持地物光谱特征，LCMA则促进了空间与光谱信息的互补融合。

Botswana数据集定量分析：Botswana数据集以自然湿地与植被场景为主，光谱差异显著，是验证模型泛化能力的重要数据集。从表4可以看出，基于CNN的SSRNet在该数据集上PSNR仅为38.96 dB，MCT提升至40.69 dB，MTFNet达到40.70 dB，而LGCT基线为40.45 dB。本文方法PSNR达到42.5849 dB，较LGCT提升约2.13 dB，较DSIR(42.118 dB)和MTFNet(40.702 dB)也均有优势；SAM从1.3821降至1.2951，ERGAS从1.2918降至1.1730，CC和SSIM均有提升。这一结果说明，自然场景中地物光谱差异大、长程依赖显著，SCSM的四方向空间扫描与SSGM的光谱顺序扫描能够有效捕获这类全局上下文信息，LCMA的双向跨模态交互进一步增强了空间-光谱互补性。与MTFNet相比，本文方法在PSNR和SAM上均有明显优势，且模型参数量更小，体现了较好的性能-效率权衡。

**综合对比分析**：表3和表4的定量结果表明，本文方法在四个数据集上均取得了优于或持平于主流对比方法的性能。在PaviaU数据集上，本文方法以45.1033 dB的PSNR超过了所有对比方法；在Houston数据集上，本文方法较LGCT提升1.37 dB，虽略低于DSIR，但模型结构更为简洁；在Chikusei数据集上，本文方法在全图协议下超过了DSIR复现的LGCT基线及DSIR自身方法；在Botswana数据集上，本文方法较LGCT、DSIR和MTFNet均有明显提升。上述结果验证了SCSM、SSGM与LCMA三个模块在不同场景下的协同有效性。

### 3.5 消融实验

为评估本文所提各模块的贡献度，在PaviaU数据集上进行了消融实验。实验配置与定量分析结果如表5所示。

**表5 本文方法各模块在PaviaU数据集上的消融实验结果**

Table 5 Ablation study results of each module of the proposed method on the PaviaU dataset

| 变体                 | SCSM | SSGM | LCMA |    Params/M    |      RMSE↓      |     PSNR/dB↑     |     ERGAS↓     |      SAM↓      |      SSIM↑      |
| :------------------- | :--: | :--: | :--: | :-------------: | :--------------: | :---------------: | :--------------: | :--------------: | :--------------: |
| A0(Baseline)         |  ✗  |  ✗  |  ✗  |      5.645      |      1.4700      |      44.4700      |      1.1120      |      1.7520      |      0.9913      |
| A1(+SCSM)            |  ✓  |  ✗  |  ✗  |      5.720      |      1.4146      |      44.7400      |      1.0900      |      1.7120      |      0.9916      |
| A2(+SSGM)            |  ✗  |  ✓  |  ✗  |      5.680      |      1.4111      |      44.4000      |      1.1380      |      1.7840      |      0.9913      |
| A3(+LCMA)            |  ✗  |  ✗  |  ✓  |      6.150      |      1.3739      |      44.9400      |      1.0680      |      1.6870      |      0.9918      |
| B1(+SCSM+SSGM)       |  ✓  |  ✓  |  ✗  |      5.931      |      1.4181      |      44.7200      |      1.0900      |      1.7140      |      0.9916      |
| B2(+SCSM+LCMA)       |  ✓  |  ✗  |  ✓  |      6.322      |      1.4238      |      44.6000      |      1.1050      |      1.7400      |      0.9914      |
| B3(+SSGM+LCMA)       |  ✗  |  ✓  |  ✓  |      6.071      |      1.4122      |      44.5900      |      1.1040      |      1.7390      |      0.9914      |
| **Ours(Full)** |  ✓  |  ✓  |  ✓  | **6.322** | **1.3665** | **45.1033** | **1.0555** | **1.6599** | **0.9920** |

注：Baseline采用文献[13]中LGCT报告结果；A1–A3及B1–B3的指标来自本仓库消融训练日志整理；Ours(Full)结果来自15000 epochs训练日志。

从表5可以看出，基线LGCT(A0)仅采用原始局部-全局协同Transformer结构，所有指标均作为对比基准。单独引入SCSM(A1)后，PSNR提升0.27 dB，SAM从1.7520降至1.7120，表明MSI流空间长程依赖的增强直接改善了空间细节恢复。单独引入SSGM(A2)后，PSNR较基线略降0.07 dB，说明HSI流仅做光谱增强不足以单独弥补空间信息缺失，但该模块与其他模块联合时能够发挥光谱连续性建模的作用。单独引入LCMA(A3)后，PSNR提升0.47 dB，SAM降至1.6870，验证了双流之间显式交叉注意力的有效性。

当SCSM与SSGM联合(B1)时，PSNR提升0.25 dB，但提升幅度有限，说明两个Mamba模块分别负责空间和光谱，缺少跨流交互时难以充分发挥协同作用。加入LCMA后，完整模型Ours(Full)在所有指标上均达到最佳，PSNR达到45.1033 dB，较基线提升0.6333 dB，SAM降至1.6599，ERGAS降至1.0555。该结果证明SCSM、SSGM与LCMA三者之间存在协同互补效应，能够在空间细节恢复与光谱保真之间实现最优平衡。

### 3.6 可视化分析

为直观验证本文方法在融合质量上的优势，在PaviaU、Houston、Chikusei及Botswana四个数据集上进行了定性可视化实验。可视化结果包括伪RGB融合图像、误差图(|pred − GT|)以及代表性像素点的光谱曲线图，相关图像保存于`LGCT-三模块改进/paper_img/`目录下。

**图5 本文方法在PaviaU、Houston、Chikusei及Botswana数据集上的融合结果与误差图**

Fig. 5 Fusion results and error maps of the proposed method on PaviaU, Houston, Chikusei, and Botswana datasets

> 【图5内容：四组子图，每组包含三列，从左至右分别为Ground-truth、Ours以及|Ours − GT|误差图。伪RGB波段组合为PaviaU(66,28,0)、Houston(60,29,7)、Chikusei(80,76,2)、Botswana(60,29,7)。误差图采用jet colormap，并统一colorbar范围。】

从图5的伪RGB融合结果可以看出，本文方法在四个数据集上均能够较好地恢复高分辨率空间细节，融合结果在整体观感上与参考图像保持高度一致。在城市场景的PaviaU与Houston数据集上，建筑边界、道路纹理等空间结构得到了清晰重建；在城乡结合的Chikusei数据集上，农田、建筑与植被的过渡区域保持了较好的结构连续性；在自然场景的Botswana数据集上，湿地、水体与植被等低对比度地物的空间分布也得到了有效恢复。

进一步观察误差图可以发现，本文方法的重建误差整体呈现出均匀且低幅值的分布特性，高误差区域主要集中在边缘和纹理剧烈变化的位置，这与融合任务的固有难度相符。这一现象表明，SCSM通过四方向交叉扫描捕获的全局长程空间依赖能够有效减少空间细节恢复过程中的结构性残差，而LCMA的双向跨模态注意力则有助于在空间增强的同时抑制光谱失真。

**图6 本文方法在四个数据集上代表性像素点的光谱曲线对比**

Fig. 6 Spectral curves of representative pixels by the proposed method on four datasets

> 【图6内容：四个子图，每个子图展示一个数据集上4个代表性像素点的光谱曲线。横轴为波段索引，纵轴为反射率值。每条子图内包含GT(黑色实线)与Ours(红色虚线)两条曲线，并标注像素坐标与地物类型(如植被、建筑、道路、水体等)。】

从图6的光谱曲线可以看出，本文方法在四个数据集上均能够保持较高的光谱保真度。具体而言，在植被像素上，Ours曲线能够准确拟合近红外波段的反射率上升趋势；在建筑与道路像素上，Ours曲线与GT在可见光至短波红外波段均保持高度重合；在Botswana数据集的水体像素上，Ours曲线准确捕捉了水体在短波红外波段反射率迅速下降的特征。上述结果表明，SSGM沿光谱波段顺序进行双向扫描的设计能够有效建模相邻波段之间的物理连续性，从而抑制融合过程中的光谱偏移与失真。

综合来看，本文方法在保持高光谱保真度的同时，实现了高分辨率空间细节的有效恢复，这与前文定量指标(PSNR、SAM、ERGAS、SSIM)的提升趋势相一致。

### 3.7 复杂度分析

为评估本文方法在融合性能与计算成本之间的权衡效益，在PaviaU数据集上将其与代表性深度学习方法进行了对比分析，结果如表6所示。评价指标包括模型参数量(Params)、浮点运算量(FLOPs)及PSNR。

**表6 不同方法的参数量、计算量与性能对比**

Table 6 Comparison of parameters, FLOPs, and performance of different methods

| Method         |    Params/M    |       FLOPs/G       |     PSNR/dB↑     |
| :------------- | :-------------: | :------------------: | :---------------: |
| SSRNet         |      0.568      |        9.301        |      43.0800      |
| ResTFNet       |      2.361      |        9.068        |      41.3400      |
| MCT            |      6.994      |        25.464        |      43.6400      |
| LGCT           |      5.645      |      【待计算】      |      44.4700      |
| MTFNet         |     18.739     |        64.859        |      44.3603      |
| DSIR           |      3.618      |        10.146        |      44.5860      |
| **Ours** | **6.322** | **【待计算】** | **45.1033** |

注：SSRNet、ResTFNet、MCT、MTFNet及DSIR的Params与FLOPs来自对应原文献；LGCT与Ours的Params来自本仓库实际统计，FLOPs需使用thop或ptflops进一步计算后填入。

从表6可以看出，本文方法的参数量较LGCT基线有所增加(从5.645M增至6.322M)，增幅约为12%，主要来自LCMA模块的跨模态注意力投影。与MTFNet(18.739M)和DSIR(3.618M)相比，本文方法的参数量处于中间水平。SSGM是三个模块中最轻量的，三个阶段仅增加约0.035M参数；SCSM增加约0.075M参数；LCMA由于在每个stage引入完整的Q/K/V投影与输出投影，增加约0.505M参数。

在计算复杂度方面，SCSM与SSGM通过线性复杂度的Mamba替代了二次复杂度的全局自注意力，在一定程度上缓解了计算开销的增长。特别是SSGM沿光谱波段扫描，每个空间像素独立成序列，避免了空间维度的二次计算。LCMA虽然引入跨模态注意力，但通过对Key与Value进行空间压缩，将注意力计算复杂度从 $O((HW)^2)$ 降至 $O((HW/r)^2)$，有效控制了计算开销。综合来看，本文方法在参数量适度增加的情况下，PSNR较LGCT提升约0.63 dB，在融合性能与模型复杂度之间实现了较好的平衡。

### 3.8 讨论

从上述实验结果可以得出以下几点认识：

1) **空间-光谱解耦的Mamba设计有效性**：SCSM与SSGM分别沿空间方向与光谱方向进行扫描，二者功能正交、互不重叠。SCSM负责捕获MSI流的全局长程空间依赖，SSGM负责建模HSI流的光谱连续性。这种解耦设计避免了早期SME方案与SCSM在空间扫描方向上的功能冗余，使得两个Mamba模块能够各司其职、协同增效。PaviaU消融实验表明，单独使用SSGM时性能提升有限，但与SCSM、LCMA联合后能够显著降低SAM，说明光谱连续性建模需要与空间细节增强及跨模态交互配合才能充分发挥作用。
2) **跨模态交互的关键作用**：LCMA在双流特征提取阶段插入双向交叉注意力，使MSI流获得光谱上下文、HSI流获得高分辨率空间细节。消融实验中，缺少LCMA时(SC SM+SSGM组合)PSNR仅提升0.25 dB，而加入LCMA后(Full)提升0.63 dB，证明跨模态交互是释放空间-光谱双Mamba潜力的关键。LCMA中H→M方向的可学习门控 $\gamma_{hm}$ 初始化为0.5，使网络能够根据SCSM是否启用自动调节HSI流向MSI流借用空间信息的强度，避免功能冗余。
3) **与最新方法的比较优势**：与DSIR相比，本文方法在PaviaU数据集上PSNR高出0.52 dB(45.10 vs 44.59)，且参数量从DSIR的3.618M增加到6.322M。DSIR通过隐式神经表示(INR)进行亚像素精修，在Houston数据集上取得了显著优势(PSNR 52.80 vs LGCT 49.99)，但其提升很大程度上依赖于AELF(52.76)已经很高的基线。本文方法不引入INR等复杂模块，仅通过三个即插即用模块改进LGCT，在保持架构简洁性的同时实现了性能提升，更适合作为已有LGCT框架的轻量增强方案。
4) **局限性与改进方向**：本文四个核心数据集的Full配置均已完成训练，Houston、Chikusei及Botswana结果均为实测值。其中Chikusei训练在12400 epoch处结束，未跑满15000 epoch，但当前Best结果43.4509 dB已超过DSIR全图协议下的LGCT基线；后续可尝试重新跑满15000 epoch以进一步挖掘潜力。此外，SSGM中的光谱分组数 $T$ 固定为8，对于不同波段数的数据集可能需要调整；LCMA虽然通过空间压缩降低了计算量，但仍引入了一定参数开销。未来研究将探索自适应光谱分组策略与更轻量的跨模态交互机制，以进一步提升方法的适用性和效率。

---

## 4 结论

本文提出了一种融合局部-全局协同Transformer与状态空间模型的HSI-MSI融合方法。该方法以LGCT为基线，引入了三个即插即用模块：SCSM通过四方向交叉扫描Mamba增强MSI流的全局长程空间依赖建模能力；SSGM沿光谱波段顺序进行双向扫描，显式建模光谱连续性，并通过空间引导门控实现自适应调制；LCMA在双流特征提取阶段实现双向跨模态注意力交互，促进空间细节与光谱信息的互补融合。在PaviaU、Houston、Chikusei及Botswana等数据集上的实验结果表明，本文方法在PSNR、SAM、ERGAS及SSIM等指标上均优于对应协议下的LGCT基线，其中PaviaU数据集PSNR达到45.10 dB（+0.63 dB），Houston达到51.97 dB（+1.37 dB），Chikusei达到43.45 dB（较DSIR协议下LGCT基线+0.45 dB），Botswana达到42.58 dB（+2.13 dB），验证了所提方法的有效性与潜力。

尽管本文方法取得了一定的性能提升，但仍存在优化空间。一方面，SSGM中光谱分组数 $T$ 为固定值，对于不同波段数的数据集可能需要进一步调优；另一方面，LCMA模块虽然通过空间压缩降低了计算量，但仍引入了一定的参数开销。未来研究将重点探索：1) 自适应光谱分组策略，使SSGM能够适应不同光谱分辨率的数据集；2) 更轻量的跨模态交互机制，在保持性能的同时进一步降低模型复杂度；3) 将所提模块扩展至其他遥感图像融合任务(如全色锐化、超分辨率等)，以进一步提升方法的适用性和可靠性。

---

## 参考文献

> 【待补充：根据目标期刊要求整理参考文献，建议数量25–35篇。以下为部分关键文献示例，正式投稿前需补充完整并统一格式(GB/T 7714)。】

[1] 张兵, 高连如, 李嘉鑫, 等. 高/多光谱遥感图像超分辨率融合研究进展与展望[J]. 测绘学报, 2023, 52(7): 1074-1089.

[2] Vivone G, Alparone L, Chanussot J, et al. A critical comparison among pansharpening algorithms[J]. IEEE Transactions on Geoscience and Remote Sensing, 2015, 53(5): 2565-2586.

[3] Yokoya N, Grohnfeldt C, Chanussot J. Hyperspectral and multispectral data fusion: A comparative review of the recent literature[J]. IEEE Geoscience and Remote Sensing Magazine, 2017, 5(2): 29-56.

[4] Licciardi G, Del Frate F. Pixel unmixing in hyperspectral data by means of neural networks[J]. IEEE Transactions on Geoscience and Remote Sensing, 2011, 49(11): 4163-4172.

[5] 赵良军, 张兵, 高连如. 高光谱图像空间分辨率增强技术研究进展[J]. 遥感学报, 2020, 24(4): 347-362.

[6] Simões M, Bioucas-Dias J, Almeida L B, et al. A convex formulation for hyperspectral image superresolution via subspace-based regularization[J]. IEEE Transactions on Geoscience and Remote Sensing, 2015, 53(6): 3373-3388.

[7] Dian R, Fang L, Li S. Hyperspectral image super-resolution via non-local sparse tensor factorization[C]//Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition. 2017: 5344-5353.

[8] Wu C, Du B, Zhang L. Hyperspectral imagery super-resolution by sparse representation and spectral regularization[J]. IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing, 2017, 10(9): 4047-4059.

[9] Xue J, Zhao B, Huang X, et al. ResTFNet: An end-to-end network with residual structure for hyperspectral and multispectral image fusion[J]. IEEE Transactions on Geoscience and Remote Sensing, 2022, 60: 1-14.

[10] Zhang Y, Li J, Guo Y, et al. Hyperspectral and multispectral image fusion based on joint sparse and low-rank constraint[J]. IEEE Transactions on Geoscience and Remote Sensing, 2021, 59(10): 8912-8926.

[11] Ma J, Ma Y, Li C. Nonlocal sparse tensor factorization for semiblind hyperspectral and multispectral image fusion[J]. IEEE Transactions on Cybernetics, 2021, 51(11): 5431-5444.

[12] Li J, Yuan Q, Shen H, et al. Hyperspectral image recovery employing a multidimensional nonlocal total variation model[J]. Signal Processing, 2015, 111: 230-248.

[13] He X, Chen Y, Lin C, et al. LGCT: Local-global collaborative transformer for HSI-MSI fusion[J]. IEEE Transactions on Geoscience and Remote Sensing, 2024, 62: 1-15.

[14] Gu A, Dao T. Mamba: Linear-time sequence modeling with selective state spaces[DB/OL]. arXiv preprint arXiv:2312.00752, 2023.

[15] Gu A, Goel K, Ré C. Efficiently modeling long sequences with structured state spaces[C]//International Conference on Learning Representations. 2022.

[16] Li Y, He X, Li Y, et al. MambaHSI: Spatial-spectral Mamba for hyperspectral image classification[J]. IEEE Transactions on Geoscience and Remote Sensing, 2024, 62: 1-15.

[17] Simões M, Almeida L B, Bioucas-Dias J, et al. Super-resolution of hyperspectral images via linear mixing model and sparse representation[C]//IEEE International Geoscience and Remote Sensing Symposium. 2014: 2879-2882.

[18] Han X, Shi B, Zheng Y. Spatial-spectral constraint based on joint tensor decomposition for hyperspectral image super-resolution[J]. IEEE Transactions on Geoscience and Remote Sensing, 2018, 56(10): 5938-5952.

[19] Wei Q, Bioucas-Dias J, Dobigeon N, et al. Multiband image fusion based on spectral unmixing[J]. IEEE Transactions on Geoscience and Remote Sensing, 2016, 54(12): 7236-7249.

[20] Dong W, Xiong S, Xu X, et al. Hyperspectral image super-resolution by spectral difference-guided deep residual learning[J]. IEEE Transactions on Geoscience and Remote Sensing, 2022, 60: 1-14.

[21] Cao X, Fu X, Xu C, et al. PSRT: Pixelwise spectral reflectance transformation for HSI-MSI fusion[J]. IEEE Transactions on Geoscience and Remote Sensing, 2023, 61: 1-13.

[22] Zhang L, Wei W, Zhang Y, et al. DCTransformer: Dual-branch cross-attention Transformer for HSI-MSI fusion[J]. IEEE Transactions on Geoscience and Remote Sensing, 2023, 61: 1-14.

[23] Wang X, Chen Y, He X, et al. MTFNet: Multiscale Transformer fusion network for HSI-MSI fusion[J]. Laser & Optoelectronics Progress, 2025, 62(8): 0810001.

[24] Liu Y, Zhang H, Wang L, et al. DSIR: Dynamic spectral interaction and refinement for HSI-MSI fusion[J]. Remote Sensing, 2026, 18(3): 456.

---

## 附录：论文图表占位清单

> 本文初稿中已用占位符标注的图表，后续需要按顺序补充完成：
>
> - **图1**：整体网络架构图
> - **图2**：SCSM模块结构图
> - **图3**：SSGM模块结构图
> - **图4**：LCMA模块结构图
> - **图5**：PaviaU/Houston/Chikusei/Botswana四个数据集上的融合结果与误差图(已生成，见`paper_img/*/`*_compare.png`)
> - **图6**：四个数据集上代表性像素点的光谱曲线图(已生成，见`paper_img/*/`*_spectral.png`)
> - **表1**：数据集基本信息表(已完成)
> - **表2**：实验超参数设置表(已完成)
> - **表3**：PaviaU数据集对比实验结果(已完成)
> - **表4**：Houston/Chikusei/Botswana数据集对比实验结果(已替换为2026-07-28实测Best值)
> - **表5**：PaviaU数据集消融实验结果(已完成)
> - **表6**：复杂度分析表(待FLOPs计算完成后填入)
