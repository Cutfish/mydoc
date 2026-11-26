
`git status` 找到冲突文件，编辑文件并删除 `<<<<<<<`、`=======`、`>>>>>>>` 冲突标记，保留正确内容

### 9.15 字节AI 中台一面

#### 算法：最长无重复子串 + Expired LRU

```Go
package main

import (
	"fmt"
	"time"
)

type DListNode struct {
      Key int
      Val int
      Next *DListNode
      Pre *DListNode
      SetAt time.Time
}

type ExpiredLRU struct {
      M map[int]*DListNode
      Len int
      Capcity int
      Tail *DListNode
      Head *DListNode
      ExpiredDur time.Duration
}

func NewExpiredLRU(cap int, expiredDur time.Duration) ExpiredLRU {
      lru := ExpiredLRU{
            M : map[int]*DListNode{},
            Len: 0,
            Capcity: cap,
            Tail: &DListNode{},
            Head: &DListNode{},
            ExpiredDur: expiredDur,
      }
      lru.Head.Next = lru.Tail
      lru.Tail.Pre = lru.Head

      return lru
}

func (lru *ExpiredLRU ) RemoveNode (p *DListNode) {
      p.Next.Pre = p.Pre
      p.Pre.Next = p.Next
      p.Next = nil
      p.Pre = nil
}

func (lru *ExpiredLRU ) MoveToHead (p *DListNode) {
      p.Next = lru.Head.Next
      p.Pre = lru.Head
      lru.Head.Next.Pre = p
      lru.Head.Next = p
}

func (lru *ExpiredLRU) Get (key int) int {
      lru.ExpiredKeyRemove(key)
      if v, ok := lru.M[key]; ok {
            lru.RemoveNode(v)
            lru.MoveToHead(v)
            return v.Val
      } else {
            return -1
      }
}

func (lru *ExpiredLRU) ExpiredKeyRemove (key int) {
      if v, ok := lru.M[key]; ok {
            if time.Since(v.SetAt) >= lru.ExpiredDur {
                  delete(lru.M, v.Key)
                  lru.RemoveNode(v)
                  lru.Len--
            } else {
                  v.SetAt = time.Now()
                  lru.RemoveNode(v)
                  lru.MoveToHead(v)
            }
      }
}


func (lru *ExpiredLRU ) Set (key, val int) {
      lru.ExpiredKeyRemove(key)
      if v, ok := lru.M[key]; ok {
            lru.RemoveNode(v)
            lru.MoveToHead(v)
            v.Val = val
      } else {
            lru.Len++
            if lru.Len > lru.Capcity {
                  delete(lru.M, lru.Tail.Pre.Key)
                  lru.RemoveNode(lru.Tail.Pre)
                  lru.Len--
            }
            p := &DListNode{
                  Key: key,
                  Val: val,
                  SetAt: time.Now(),
            }
            lru.MoveToHead(p)
            lru.M[key] = p
      }
}

func test() {
      lru := NewExpiredLRU(5, 5*time.Second)
      lru.Set(1, 1)
      fmt.Println(lru.Get(1))
      time.Sleep(6 * time.Second)
      fmt.Println(lru.Get(1))
      lru.Set(1, 2)
      fmt.Println(lru.Get(1))
      fmt.Println(lru.Get(2))
}
```

1、http 1.1 vs http 2.0 vs http 3.0

**http1.0 1.1 2.0 3.0 https区别** http vs https 端口号、URL前缀、安全性和资源消耗、SEO 1.0 vs 1.1 连接方式、状态响应码、缓存机制、带宽、Host头部 1.1 vs 2.0 连接方式、二进制帧、头部压缩、服务器推送 2.0 vs 3.0 连接方式、响应时间、头部压缩、连接迁移、错误恢复、安全性 **WebSocket和http区别** 单/双向实时通信协议、协议前缀、扩展、数据包头部小

### 9.16 百度 SRE 一面

#### 算法：螺旋矩阵

好久没写都快忘了，记得判断转方向之后用else，防止二次计算

1、docker中的sock文件是干什么的，使用sock挂载进容器破坏了docker的什么性质

`docker.sock` 是 Docker Client 与宿主机 Docker Daemon 通信的 Unix Socket。容器如果挂载并能够访问宿主机的 `docker.sock`，实际上就获得了调用 Docker API、控制 Docker Daemon 的能力。由于 Docker Daemon 通常拥有宿主机较高权限，这会破坏原本的容器隔离边界，使攻击者能够借助 Docker 的控制能力进一步突破容器，影响宿主机。

### 9.23 得物一面

算法：判断整数是否是回文整数（不能转string）。引导型，问问解决方案，一般就是提取进制位。优化方案，为了避免溢出（12345变为54321）可以用反转一半。

```Go
package main

import "fmt"

func main() {
	fmt.Println(pattern(123321))
	fmt.Println(pattern(1235321))
}
// 123
// 3 + 2 * 10 + 1 * 10 * 10 = 123
func pattern(num int) bool {
	halfReverseNum := 0
	for num > halfReverseNum {
		a := num / 10
		b := num % 10
		halfReverseNum = halfReverseNum * 10 + b 
		num = a
		fmt.Println("num", num, " halfReverseNum", halfReverseNum)
	}

	return halfReverseNum == num || halfReverseNum / 10 == num
}
```

1、kafka不丢消息。只说了第一个和第二个，中间的没有说。
1.生产者使用异步回调发送消息，设置重试机制应对网络问题。
2.在Broker中通过复制机制，设置acks参数为all，确保消息在所有副本中都得到确认。
3.消费者手动提交消费成功的offset，避免自动提交可能导致的数据丢失或重复消费。

### 9.23 百度二面

1、tcp拥塞控制、流量控制是怎么做的

 **流量控制** ：接收方维护一个 **接收缓冲区** ，通过 TCP 头里的 **窗口字段（Window Size）** 告诉发送方："我还能再收 N 字节，你别发超过这个量。"

> 接收方说"我碗就这么大，你一次别盛太多"，发送方按碗的大小发。

 **拥塞控制** ：发送方维护一个 **拥塞窗口 cwnd** ，可以根据接收方的接收能力和网络拥塞情况来判断。

> 发送方不知道路上堵不堵，就先少发点试试，不堵就多发，堵了（丢包）就减半。

 **四个阶段大白话** ：

* **慢启动** ：先发 1 个，成了发 2 个，再 4 个，指数试探。
* **拥塞避免** ：快到极限了，每次只加 1 个，慢慢试。
* **快重传** ：连着 3 个重复 ACK，说明丢包了，别等超时，赶紧重传。
* **快恢复** ：只是丢个别包，不用从头来，窗口砍一半继续。

2、tcp、udp区别

3、全能王实习时候AI需求，调AI API的提示词设计和优化。

### 9.24 字节一面

1、epoll两种模式

Linux 中，epoll 有两种工作模式：

1. LT（Level Triggered，水平触发）：默认模式
2. ET（Edge Triggered，边缘触发）：需要设置 EPOLLET

* LT：有数据没读完，就持续通知。
* ET：出现新的就绪事件才通知，因此因为 ET 模式下通常需要循环读取数据，直到缓冲区被读空。

### 10.10 小红书一面

1、linux网络代理的模式有哪些，linux和docker之间的代理是什么走的，有什么方式，包是怎么走了，怎么跳的，包的信息有什么变化没有。

2、k8s 服务发现的基本原理

3、技术选型：kafka还是http请求

### 10.10 得物二面

1、协程panic，怎么用recover捕获

一个 goroutine 发生未恢复的 panic，通常会导致整个程序崩溃。defer 不必须放在函数第一行，只要在发生之前注册即可，所以一般还是放在第一位。

2、合并分支，解决冲突，使用什么命令

```
git switch main
git merge feature
git status // 找到冲突文件，编辑文件并删除 <<<<<<<、=======、>>>>>>> 冲突标记，保留正确内容
git add .
git commit
```

3、路由匹配使用前缀树和hash匹配，用哪个好

| 路由类型                                   | 更合适的方式                                   |
| ------------------------------------------ | ---------------------------------------------- |
| `/users/list`这类固定路径、精确匹配      | Hash 表                                        |
| `/users/:id`、`/files/*path`、前缀匹配 | 前缀树                                         |
| 两种路由都有                               | 先用 Hash 表查固定路径，再用前缀树匹配动态路由 |

两者都会花时间读取请求路径，实际性能还取决于路由数量和请求分布。

4、Nginx的七层代理怎么理解，是什么意思

### 10.12 理想一面

1、sync.map原理

1.24之前的版本，是读写分离。

读取主要靠原子操作，修改时锁住相关节点，因此不同 key 的操作更有机会并行。

* **`read` 是前台** ：大家可以同时查，通常不用等锁。
* **`dirty` 是后台** ：新来的 key 先放这里。查后台要先拿锁，避免和正在修改后台的人撞上。
* **`misses` 是计数器** ：记录“前台没找到，不得不去后台查”的次数。

我想问问dirty提升为read之后，再修改dirty，read本身的数据也会变对吧

2、一个redis内存限制2G，现在只有1G多，配置AOF还是RDB

AOF 平时追加写入不需要为每次写入创建子进程；RDB 每次生成快照都要 `fork`。不过 **AOF 重写时也会 `fork`**

写时复制：

* Redis 创建一个子进程。子进程负责把当时的数据写入快照。
* 刚创建时，父子进程 **共享内存页** ，不会立刻复制整个数据集。
* 如果此时客户端修改数据，父进程要改到的内存页会先被复制。子进程继续看旧页，保证快照内容不被后续写入改变；父进程使用新页继续处理请求。

所以在写时复制时候，如果有大量的修改数据会导致内存占用骤增。

所以最好选择RDB。

AOF  **平时是不断追加写命令** ；“重写”是定期把累积的历史操作整理成一份能恢复**当前数据**的更紧凑文件。比如同一个 key 被 `INCR` 100 次，重写时不必保留这 100 次历史操作。**自动触发** ：AOF 文件达到最小大小，并且相对上次重写后的大小增长达到设定比例。也有手动触发。

3、健康检查的方式

| 检查方式 | 检查原理                     | 优点                   | 缺点                   |
| -------- | ---------------------------- | ---------------------- | ---------------------- |
| ICMP检查 | 通过ping检测主机网络连通性   | 简单、开销小           | 无法判断应用是否正常   |
| TCP检查  | 尝试建立TCP连接              | 可以判断端口是否可连接 | 不能保证业务正常       |
| HTTP检查 | 请求ping 接口，检查响应状态 | 可以检测应用状态       | 需要提供HTTP接口       |
| 命令检查 | 执行命令判断运行状态         | 灵活，适合Redis、MySQL | 依赖命令执行环境       |
| 业务检查 | 实际执行简单的业务操作       | 检查结果更加准确       | 开销较大，可能影响性能 |

4、openresty的插件有没有写过，是什么

### 10.13 百度三面

1、将帅士，多少排列组合

```Go
package main

import "fmt"

type Point struct {
	x, y int
}

func main() {
	// 1. 士的 5 个固定点位
	shiPositions := []Point{
		{4, 1}, {4, 3},
		{5, 2},
		{6, 1}, {6, 3},
	}

	// 2. 黑方九宫所有点（将的候选位置）
	var jiangPositions []Point
	for x := 4; x <= 6; x++ {
		for y := 1; y <= 3; y++ {
			jiangPositions = append(jiangPositions, Point{x, y})
		}
	}

	// 3. 红方九宫所有点（帅的候选位置）
	var shuaiPositions []Point
	for x := 4; x <= 6; x++ {
		for y := 8; y <= 10; y++ {
			shuaiPositions = append(shuaiPositions, Point{x, y})
		}
	}

	legalCount := 0

	// 遍历所有可能的组合
	for _, shi := range shiPositions {
		for _, jiang := range jiangPositions {
			// 约束 1：将与士不能在同一格
			if jiang == shi {
				continue
			}

			for _, shuai := range shuaiPositions {
				// 约束 2：将帅同列时，检查士是否在两者之间阻隔
				if jiang.x == shuai.x {
					isBlocked := (shi.x == jiang.x) && (shi.y > jiang.y)
					if !isBlocked {
						continue // 形成照面，非法
					}
				}

				legalCount++
			}
		}
	}

	fmt.Printf("不出现将军的合法排列组合数: %d\n", legalCount)
}
```

2、为什么要有DNS协议

### 10.21 理想二面

1、tcp上次握手，序列号x是怎么变化为x+1的

2、进程切换和线程切换代价，谁的更大，为什么

通常进程切换更昂贵。两者都需要保存和恢复 CPU 上下文，但不同进程之间还涉及虚拟地址空间和页表切换，可能造成 TLB 缓存失效及更多 Cache Miss。而同一进程内的线程共享虚拟地址空间，不需要切换页表，所以通常开销更小。

3、uuid转base62，从36个字符转为22个字符。UUIDv4 基于随机数生成，具有很低的碰撞概率，并且难以预测。

### 10.24 经纬恒润一面

1、interface的底层

// 空接口
type eface struct {
    _type *_type
    data  unsafe.Pointer
}

// 非空接口
type iface struct {
    tab  *itab
    data unsafe.Pointer
}

2、

### 10.23 小红书一面

1、算法：加权轮询（平滑）、一致性哈希

**平滑加权轮询（Smooth Weighted Round-Robin）**

- **思路**：每个节点维护两个权重：`Weight`（配置的固定权重）和 `CurrentWeight`（动态变化的当前权重，初始为 0）。
  1. 每次调度前，遍历所有节点：`node.CurrentWeight += node.Weight`；
  2. 选出当前 `CurrentWeight` 最大的节点作为被调度的节点；
  3. 被选中的节点减去所有节点的权重之和：`bestNode.CurrentWeight -= totalWeight`。

```go
package main

import "fmt"

type Node struct {
	Name          string
	Weight        int // 固定权重
	CurrentWeight int // 动态权重
}

type SmoothWeightedRR struct {
	nodes       []*Node
	totalWeight int
}

func NewSmoothWeightedRR(nodes []*Node) *SmoothWeightedRR {
	total := 0
	for _, n := range nodes {
		total += n.Weight
	}
	return &SmoothWeightedRR{
		nodes:       nodes,
		totalWeight: total,
	}
}

func (s *SmoothWeightedRR) Next() *Node {
	if len(s.nodes) == 0 {
		return nil
	}
	var best *Node
	for _, node := range s.nodes {
		// 1. 每个节点的动态权重加上自身的固定权重
		node.CurrentWeight += node.Weight

		// 2. 挑选出动态权重最大的节点
		if best == nil || node.CurrentWeight > best.CurrentWeight {
			best = node
		}
	}
	// 3. 选出的节点减去总权重
	if best != nil {
		best.CurrentWeight -= s.totalWeight
	}
	return best
}
```

**一致性哈希（Consistent Hashing）**

- **思路**：将整个哈希值空间组织成一个 $0 \sim 2^{32}-1$ 的闭合圆环。为了解决节点少时的数据倾斜和雪崩问题，每个真实物理节点生成多个虚拟节点散落在环上。查询时通过二分查找找到顺时针方向的第一个节点。

```go
package main

import (
	"hash/crc32"
	"sort"
	"strconv"
)

type HashRing struct {
	replicas int               // 每个物理节点的虚拟节点副本数
	ring     []uint32          // 哈希环（有序存储虚拟节点的哈希值）
	nodeMap  map[uint32]string // 虚拟节点哈希值 -> 真实物理节点
}

func NewHashRing(replicas int) *HashRing {
	return &HashRing{
		replicas: replicas,
		nodeMap:  make(map[uint32]string),
	}
}

// AddNode 添加真实节点
func (h *HashRing) AddNode(node string) {
	for i := 0; i < h.replicas; i++ {
		// 虚拟节点命名，如 "192.168.1.1#0"
		vNodeKey := node + "#" + strconv.Itoa(i)
		hash := crc32.ChecksumIEEE([]byte(vNodeKey))
		h.ring = append(h.ring, hash)
		h.nodeMap[hash] = node
	}
	sort.Slice(h.ring, func(i, j int) bool {
		return h.ring[i] < h.ring[j]
	})
}

// Get 根据 key 顺时针寻找最近的真实节点
func (h *HashRing) Get(key string) string {
	if len(h.ring) == 0 {
		return ""
	}
	hash := crc32.ChecksumIEEE([]byte(key))
	// 二分查找第一个 >= hash 的虚拟节点
	idx := sort.Search(len(h.ring), func(i int) bool {
		return h.ring[i] >= hash
	})
	// 如果超出末尾，环形回绕到第一个节点
	if idx == len(h.ring) {
		idx = 0
	}
	return h.nodeMap[h.ring[idx]]
}
```

2、TLS1.2和TLS1.3的区别

- **握手时延降低**：
  - **TLS 1.2** 完整握手需要 **2 个 RTT**（协商参数 + 密钥交换/验签）。
  - **TLS 1.3** 精简了握手交互，完整握手仅需 **1 个 RTT**；重连时支持携带数据的 **0-RTT**（Early Data）。
- **加密套件精简与前向安全**：
  - TLS 1.3 废除了不安全的传统算法（如静态 RSA 密钥交换、CBC 分组模式、RC4、MD5/SHA-1 等）。
  - 强制要求使用支持前向安全的算法（如 (EC)DHE），私钥即使泄露也无法解密历史流量。
- **安全性与隐私更强**：TLS 1.3 将握手过程中证书传输、扩展等敏感信息均转为加密传输，减少了明文暴露面。

3、http3.0的quic协议的RTT是0和1，为什么，3.0之前的版本是2或者3RTT

- **HTTP/1.1 与 HTTP/2（基于 TCP + TLS）为什么需要 2 或 3 个 RTT**：
  - 协议分层独立、握手必须串行执行：
    1. **TCP 握手**：先消耗 **1 RTT** 建立四元组连接；
    2. **TLS 握手**：基于已建好的 TCP 连接协商密钥。若使用 TLS 1.2 则需要 **2 RTT**（合计 **3 RTT**）；若使用 TLS 1.3 则需要 **1 RTT**（合计 **2 RTT**）。
- **HTTP/3（基于 QUIC）为什么是 1 RTT 或 0 RTT**：
  - **基于 UDP**：底层无连接，消除了 TCP 的 1 RTT 建连开销。
  - **传输与加密合并**：QUIC 将传输控制层与 TLS 1.3 深度整合。
    - **1 RTT（首次连接）**：客户端发送单个 UDP 包，同时完成连接建立和 TLS 1.3 密钥协商，服务端回包后即可加密发送应用数据。
    - **0 RTT（重连恢复）**：利用本地缓存的会话参数/凭证（Token / PSK），客户端在发送的第一个数据包中就能附带加密的 HTTP 请求（Early Data）。

4、timewait出现很多，怎么解决

> `TIME_WAIT` 是**主动关闭连接方**在收到对端 FIN 并回复 ACK 后停留 2MSL 的状态，用于防止最后一个 ACK 丢失并让旧分节在网络中自然消亡。

- **应用与架构层解决（首选，根治）**：
  - **启用 HTTP Keep-Alive / 长连接**：减少频繁建连与断连。
  - **使用连接池**：反向代理网关（如 Nginx upstream keepalive）及微服务内部调用使用连接池，避免每次请求都主动 close。
  - **避免服务端主动断连**：业务上尽量由客户端主动发起关闭，将 TIME_WAIT 转移到客户端。
- **操作系统内核参数调优（Linux Sysctl）**：
  - 允许将处于 `TIME_WAIT` 状态的 socket 端口复用于新的向外发起的连接。
  - 限制系统中处于 `TIME_WAIT` 的最大连接数，超出则直接丢弃回收（兜底防内存被打满）。

5、shareddict多个worker访问的并发控制

由于这个shareddictw我们还是用来兜底的，所以理论上不会出现太高的并发读取写入的情况。我们主要是一个键值对，然后值类型是一个队列。

### 10.29 新时达（海尔）一面

1、如何保证两个服务的数据一致性？分布式事务的方案有哪些？

（1）如何保证两个服务的数据一致性？（以业务场景为例）

在分布式系统中，不同服务拥有独立的数据库/存储，跨网络调用存在超时或失败，无法利用单机事务保证强一致性。通常采用**最终一致性**方案解决，核心在于：**操作原子落库 + 可靠投递 + 幂等消费 + 异常补偿/对账**。

* **场景 A：订单服务与库存服务（下单与减库存一致性）**

  1. **基于 MQ 事务消息 / 本地消息表（核心手段）**：
     * **本地消息表**：订单服务在同一个本地事务中完成两件事：① 生成订单记录；② 在 `local_message` 表写入一条“扣减库存任务”。
     * **异步投递与确认**：订单服务后台通过定时任务或 Canal 监听 binlog 将消息推送到 MQ；库存服务消费 MQ 并执行扣减，成功后回复 ACK 并标记消息为完成。
  2. **库存服务的接口幂等性（必备前提）**：
     * MQ 重发机制会导致重复投递，库存表需通过唯一业务流水号（如 `order_sn`）设为防重表/唯一索引，保证同一笔订单不会被扣两次库存。
  3. **逆向补偿机制（超时/取消兜底）**：
     * **延迟队列**：下单时发送 30 分钟延迟消息，若用户超时未支付，自动触发回滚逻辑：订单置为取消，并给库存服务发送消息退还库存。
  4. **业务对账系统**：
     * 每日/定时跑离线对账脚本（T+1），对比订单表与库存流水，发现不一致（如掉单、丢消息）自动预警并补发修正。
* **场景 B：服务内部修改 MySQL 与修改 Redis 的一致性（双写一致性）**

  1. **最标准工程方案：Cache-Aside Pattern（先更库，再删缓存）**
     * *为什么先更库再删缓存？* 发生并发不一致的概率最低（读请求读旧库到写入缓存之间的时间窗口极短）。
     * *延时双删*：先删缓存 $\to$ 更新数据库 $\to$ sleep(500ms) $\to$ 再次删缓存，防止先删后有并发读请求把旧数据又重新载入缓存。
  2. **异步保障删除成功：Canal 监听 Binlog + MQ 重试**
     * 业务代码只管更新 MySQL，不再侵入式操作 Redis。
     * 通过 Alibaba Canal 伪装成从库读取 MySQL Binlog 变更日志，将数据变更消息写入 MQ。
     * 消费服务从 MQ 中拉取日志，负责去 Redis 执行 `del key`。如果删除失败，依靠 MQ 自带的指数退避重试机制持续重试，彻底避免代码中断导致的缓存脏数据。

---

（2）分布式事务的方案有哪些？

根据 CAP / BASE 理论，分布式事务分为追求**强一致性（刚性事务）**和**最终一致性（柔性事务）**两大类：

1. **刚性事务（追求强一致性 / CP）**：

   * **2PC（两阶段提交 / XA 规范）**：
     * 由协调者统一指挥参与者：① **Prepare 阶段**（各节点预执行事务并上锁，回复 Yes/No）；② **Commit 阶段**（全员 Yes 则提交，任一 No 则回滚）。
     * *优缺点*：强一致，但性能极差、同步阻塞长、协调者存在单点故障、网络分区时可能导致资源长期被死锁。
   * **3PC（三阶段提交）**：
     * 在 2PC 基础上拆为三个阶段：`CanCommit` $\to$ `PreCommit` $\to$ `DoCommit`，并引入参与者超时机制。
     * *优缺点*：缓解了参与者资源阻塞，但流程更繁琐，网络分区时依然存在数据不一致风险，工业界极少直接使用。
2. **柔性事务（追求最终一致性 / AP，工业界主流）**：

   * **TCC（Try-Confirm-Cancel）**：业务侵入型的两阶段补偿模式。
     * `Try`：资源检查与预留（如冻结用户 100 元，而不是直接扣除）。
     * `Confirm`：确认执行业务，真正扣除冻结的资源（不产生新的资源校验，必须成功）。
     * `Cancel`：业务取消，释放预留的资源（解冻金额）。
     * *适用场景*：核心交易链路（如支付、转账），性能好；但业务代码侵入极高，需自己保证防悬挂、空回滚和幂等性。
   * **可靠消息最终一致性（本地消息表 / RocketMQ 事务消息）**：
     * 利用消息队列串联上游与下游，上游确保本地事务与消息发出一同成功，下游保证幂等消费。链路完全解耦，吞吐量极高。
   * **Saga 模式（长事务编排 / 补偿模式）**：
     * 将长流程拆解为多个本地子事务 $T_1, T_2, ..., T_n$；每个子事务对应一个补偿动作 $C_1, C_2, ..., C_n$。
     * 若执行到 $T_i$ 失败，则逆序执行 $C_{i-1}, ..., C_1$ 进行业务层冲正。
     * *适用场景*：业务流程长、涉及外部第三方调用的系统（如订机票 + 订酒店旅游场景）。
   * **最大努力通知**：
     * 发起方通过重试机制（如阶梯时间退避通知）尽最大努力把状态同步给接收方，同时提供查询接口供接收方主动核对（如微信/支付宝对商户的回调机制）。

2、统计一个数组中的重复次数最多的元素，如果数据存在一个大文件中，内存无法加载这个文件，可以用什么方法？如果连map都没有办法创建还有别的方法吗？

- **场景一：内存放不下大文件，但内存可以放下小文件的 Map（哈希分治 / 分而治之）**

  - **核心思路**：将大文件切分成若干个小文件，保证**相同的元素一定落入同一个小文件**。
  - **步骤**：
    1. **Hash 分流**：顺序读取大文件中的每个元素，计算 `hash(element) % N`（N 为分片数），分别追加写入到 `file_0, file_1, ..., file_{N-1}` 中。
    2. **局部统计**：依次将每个小文件读入内存，使用 `map[element]int` 统计词频，记录当前小文件出现次数最多的元素及频次。
    3. **全局汇总**：遍历完所有小文件的局部最大值，挑出全局频次最高的那一个。
- **场景二：极度受限环境（内存极小，连小文件的 Map 都建不了）**

  - **解法 1：外部排序（External Merge Sort）+ 单变量遍历统计（最标准解法）**
    - **步骤**：
      1. **分块排序**：将大文件分批读入内存（只占极小数组），内部快排后输出为多个有序小文件（Run）。
      2. **多路归并（K-Way Merge）**：利用最小堆（仅维护 K 个指针/元素，内存开销极小），对所有有序小文件做多路归并，输出为一个**全局完全有序的大文件**（或流式读取）。
      3. **流式单变量统计**：由于相同元素已经全部相邻排列，只需顺序扫描排好序的数据流，维护两个变量 `current_count` 和 `max_count`，遇到不同元素就比对更新，**完全不需要 map，内存复杂度为 $O(1)$**。
  - **解法 2：B+ 树 / 嵌入式磁盘 KV（借助外存）**
    - 使用磁盘索引数据库（如 SQLite / RocksDB / LevelDB），将文件逐行读取写入，Key 为元素，利用其内置的 LSM-Tree 或 B+Tree 磁盘结构执行 `count++`。内存仅需微小的读写缓冲区。
  - **解法 3：近似估算（Count-Min Sketch，如果允许极小误差）**
    - 若只需要统计近似 Top 元素且允许微小误判，使用 Count-Min Sketch（二维计数数组 + 多重哈希），内存占用仅为固定几百 KB 到几 MB，完全无需动态 map。
  - **特例：摩尔投票法（Boyer-Moore Voting Algorithm）**
    - *前提条件*：如果题意中某个元素的出现次数**超过了总数的一半（绝对众数）**，可直接使用摩尔投票法流式遍历整个文件，只需要两个变量 `candidate` 和 `count`，空间复杂度直接为 $O(1)$。

### 新时达二面

回答的东西面试官都没有反馈，两个面试官，一个是CTO，希望能过。

### 11.3 Vast一面

1、varchar转换为int不行还是int转换为varchar不行
 **mysql只能`varchar` 转换为 `int` ；比如字段是 `int`，传入 `varchar` 可以正常走索引。
2、agents.md有没有渐进式加载**

#### **渐进式加载的三层机制（Three-tier Loading）：**

1. **Level 1：元数据层（Discovery / 发现阶段，常驻加载）**

* 会话启动时，系统仅加载每个 agent / skill 的 **元数据（Name + Description / 简短功能摘要）**。
* Token 消耗极小（通常仅几十 Token），仅用于告知主模型“当前有哪些工具/规范可用”。

1. **Level 2：指令层（Activation / 激活阶段，按需加载）**

   * 当用户的问题命中某个 agent / skill 的描述时，才触发读取并加载该 `AGENTS.md`的**完整正文、工作流（SOP）和详细规则**。
2. **Level 3：执行资源层（Execution / 执行阶段，惰性加载）**

   * 正文中引用的具体脚本（Scripts）、参考资料（References）、模板文件等，只有在 Agent 具体执行某一步骤需要时，才由工具实时读取（On-demand read）。

3、小表驱动大表还是大表驱动小表

* **结论**：**核心思想是“以小驱大”**。

  * **为什么？**
  * **有索引时（INLJ）**：外层决定循环次数，内层查索引（O(log⁡N)O(\log N)**O**(**lo**g**N**)）。小表驱动可让外层总循环次数最小（Mlog⁡N≪Nlog⁡MM \log N \ll N \log M**M**log**N**≪**N**log**M**）。
  * **无索引时（BNL）**：小表数据能一次性塞入 `join_buffer`，避免被驱动表被多次重复全表扫描。
  * **小表必须写在左边吗？**
  * **INNER JOIN**：**不一定**。MySQL 优化器会自动根据成本选择小表作为驱动表，书写顺序不影响。
  * **LEFT JOIN**：**必须写在左边**。业务语义强制左表为驱动表，若把大表写左边就会导致性能灾难。
  * **“小表”标准**：不是看物理总行数，而是看经过 `WHERE`过滤后的**有效结果集大小**（行数 × 行宽度）。

### 11.3 扬腾创新一面

### 11.4经纬恒润二面

### 11.6 Vast二面

1、怎么考虑稳定性？
从**事前预防、事中止损、事后复盘**三阶段系统性考虑：

- **事前预防（架构与防御）**：
  - **三板斧防护**：限流（防流量打垮）、熔断降级（防下游雪崩）、合理设置超时与重试。
  - **资源与链路隔离**：核心与非核心业务隔离、线程池隔离、读写分离，防止单点故障扩散。
  - **高可用与容灾**：无状态服务多副本横向扩容、主从自动切换（Failover）、定期全链路压测与故障演练。
- **事中应对（可观测与快速止损）**：
  - **立体可观测**：监控指标（Prometheus）、链路追踪（Trace）、集中日志（ELK），支持秒级异常告警。
  - **快速止损手段**：一键降级动态开关（秒级关停次要功能）、流量调度切流、自动化弹性伸缩（HPA）。
- **事后治理**：故障根因复盘（5 Why 分析法），闭环推进优化项，反哺架构设计。

2、缓存、基于磁盘存储的中间件有哪些

- **内存/缓存类中间件**：
  - **分布式缓存**：Redis（数据读写纯内存，兼具 RDB/AOF 磁盘持久化）、Memcached（多线程纯内存 KV，不支持持久化）。
  - **本地缓存**：Caffeine、Guava Cache（JVM 进程内，零网络开销，常与 Redis 构建多级缓存）。
- **基于磁盘存储的中间件**：
  - **关系型数据库**：MySQL（InnoDB 引擎 B+ 树索引 + Redo/Undo Log 落盘）、PostgreSQL。
  - **消息队列（MQ）**：Kafka（利用磁盘顺序写 + PageCache + 零拷贝 sendfile 实现极高吞吐）、RocketMQ（基于 CommitLog 磁盘顺序落盘）。
  - **分布式与 NoSQL**：RocksDB（LSM-Tree 经典磁盘存储引擎）、TiKV、MongoDB。
  - **海量搜索与分析**：Elasticsearch（基于 Lucene 磁盘倒排索引）、ClickHouse（列式存储 MergeTree 落盘）。

### 11.9 扬腾创新二面

1、灰度策略有哪些

- **按用户属性**：内部白名单、按地区/客户端版本、UID 哈希取模（按 1% -> 10% -> 100% 逐步放量）。
- **按流量特征**：HTTP Header/Cookie 染色路由、网关权重切流（如 9:1 分流）、流量镜像（影子发布静默验证）。
- **发布模式**：金丝雀发布（少量新节点试跑）、蓝绿发布（两套环境一键秒级切换）、滚动发布。

2、redis的LRU有没有独特之处，是标准的吗

- **不是标准 LRU，是近似 LRU**。
- **独特之处**：
  1. **零额外指针开销**：不用“哈希表 + 双向链表”（节省 prev/next 指针开销），仅在对象头用 24bit 记录最后访问时间。
  2. **淘汰候选池机制（3.0+，核心流程）**：
     - **不是在池中随机淘汰**，而是维护一个容量为 16、**按空闲时间从小到大升序排序**的候选池。
     - **池的维护**：每次依然随机采样 $N$ 个 key（默认 5 个），若采样 key 的空闲时间大于池中最小值（或池未满），则按顺序插入池中；池满则挤出池头（空闲时间最小的）。
     - **精确淘汰**：直接从**候选池末尾（空闲时间最大、最久未访问）**取出 key 真正淘汰。效果极度逼近真 LRU，且内存开销几乎为零。

3、zset的底层数据结构

- **小数据量**：
  - 连续内存顺序存放 member 和 score，极大节省内存。
  - **ziplist（压缩列表，7.0 之前）**：每个节点都记录了 `prevlen`（前一节点长度）以实现反向遍历；**缺点**是当某节点长度突增时，会导致后续节点 `prevlen` 占用字节级联膨胀，引发**连锁更新（Cascade Update）** 性能抖动。
  - **listpack（紧凑列表，7.0 之后）**：彻底取代 ziplist。每个节点**只记录自身长度**（不再记录前一节点的长度），依靠自身长度依然能实现反向寻址，**彻底消除了连锁更新**隐患。
- **大数据量（元素数 > 128 或 长度 > 64字节）**：
  - 转换为 **dict + skiplist（哈希表 + 跳表）** 结合。
  - **dict**：保存 `member -> score` 映射，$O(1)$ 复杂度查分值。
  - **skiplist**：有序多级索引链表，$O(\log N)$ 复杂度范围检索（ZRANGE）及查排名（ZRANK）。

4、红黑树和平衡二叉树的区别

- **平衡严格度**：AVL 树**严格平衡**（左右子树高差 $\le 1$）；红黑树**弱平衡**（最长路径不超过最短路径 2 倍）。
- **维护开销**：
  - AVL 树插入最多旋转 2 次，但**删除节点可能需要 $O(\log N)$ 次旋转**。
  - 红黑树增删最多只需 **2~3 次旋转**，主要依靠变色维持平衡。
- **适用场景**：AVL 树树高更矮，适合**读多写极少**；红黑树增删综合性能更高，适合**频繁写与通用工业级场景**（如 Java HashMap、Linux CFS 调度、epoll 内核实现）。

5、centos、ubuntu、unix系统哪个IO多路复用（epoll）比较好，epoll是怎么发现一个socket是就绪的

- **系统对比（辨析考点）**：
  - **CentOS 与 Ubuntu**：底层都是 Linux 内核，同内核版本下 **epoll 性能与实现完全一致**。
  - **Unix（如 macOS / FreeBSD）**：**没有 epoll**，用的是 **kqueue**。
- **epoll 如何发现 socket 就绪**：
  1. `epoll_ctl` 添加 fd 时向协议栈注册**内核回调函数 `ep_poll_callback`**。
  2. 网卡收到数据包 $\rightarrow$ 中断将数据送入 socket 缓冲区 $\rightarrow$ 触发该回调函数。
  3. 回调函数直接把就绪的 socket 放入 **就绪双向链表（rdllist）**。
  4. `epoll_wait` 只需直接检查并返回该链表，$O(1)$ 复杂度，无需轮询全部 fd。

6、网关配置热加载，给某个配置10个端口改到100个其他的端口，怎么做的

- **核心目标**：不中断现有连接，新旧端口平滑交接（Graceful Drain）。
- **执行步骤**：
  1. **监听新端口**：网关主进程/控制面先创建、绑定并 `listen` 这 100 个新端口，开始接收新流量。
  2. **优雅下线旧端口**：
     - 关闭 10 个旧端口的 `listen`（拒绝新的三次握手 SYN）。
     - 设置排空宽限期（Drain Timeout，如 30s），让旧端口上现有的已建连接处理完毕，并返回 `Connection: close` 引导客户端重连到新端口。
  3. **释放资源**：超时或旧连接清零后，彻底关闭旧端口连接描述符。
     *(架构补充：Nginx 可走 Master Fork 新 Worker + SIGQUIT 退出旧 Worker；或利用 Linux 3.9+ 的 `SO_REUSEPORT` 无缝热切换。)*

### 11.13云揽科技一面

感觉问的都是简历上面比较简单的

### 11.18 海信一面

1、听过 SDD（需求/规范驱动开发）、TDD（测试驱动开发）、OpenSpec 等开发相关概念

- **TDD（测试驱动开发）**：“红-绿-重构”循环。先编写失败的单元测试 $\rightarrow$ 编写最小可用实现让测试通过 $\rightarrow$ 重构优化代码。保障可测性与高质量交付。
- **SDD（规范/需求驱动开发，Spec-Driven）**：代码未动，契约先行。先定义严谨的接口规范（如 OpenAPI 契约）或业务需求 Spec，再以此自动生成代码骨架、Mock 服务并驱动实现。
- **OpenSpec**：开放规范协议体系（如 OpenAPI、AsyncAPI 等标准化格式）。通过统一的机器可读契约（JSON/YAML），打破前后端及跨系统协同壁垒，实现文档、测试和网关路由自动生成。

2、agent（harness）组成部分
*Harness（智能体测试与运行底座/脚手架）是支撑 Agent 闭环运行与评估的核心容器：*

- **Sandbox Runtime（隔离运行环境）**：容器/虚拟机沙箱（如 Docker），提供安全的 Shell、文件系统供 Agent 执行代码。
- **Model Adapter（模型网关）**：负责 Prompt 拼装、Token 计数、上下文窗口控制及与各家大模型 API 对接。
- **Tool Executor（工具执行器）**：受控工具集（文件读写、Grep、Bash、Git 操作等），负责拦截并执行 Agent 的 Tool Call 并收集输出。
- **Context & Memory（上下文与记忆管理）**：管理交互轨迹、历史截断/压缩，确保上下文不超限。
- **Evaluator / Verifier（评测与校验器）**：自动化测试套件与判定逻辑，用于检查任务是否达成目标。

3、harness工作流
典型的 **“初始化 $\rightarrow$ 观察-决策-行动（ReAct 闭环） $\rightarrow$ 评测验收”** 流程：

1. **环境准备（Setup）**：启动沙箱容器，拉取指定代码分支并安装运行依赖。
2. **任务注入（Ingestion）**：解析 Issue/用户需求，封装系统指令与初始上下文传入 Agent。
3. **交互闭环（ReAct Loop）**：
   - Agent 输出思考并调用工具（Action）；
   - Harness 在沙箱中执行工具，捕获命令输出与报错（Observation）；
   - 将结果反哺回上下文，Agent 据此纠错并迭代下一步。
4. **结束判定（Termination）**：Agent 主动返回完成，或触发最大步数（Max Steps）/超时上限。
5. **验收与清理（Eval & Clean）**：运行单测/集成测试比对结果（如 SWE-bench 评测），输出得分，销毁沙箱。

### 11.24 中科飞测

1、mvcc

- **概念**：多版本并发控制（Multi-Version Concurrency Control），用于实现读写不阻塞的高并发事务控制（InnoDB 在 RC、RR 隔离级别下生效）。
- **核心组成**：
  - **隐藏列**：`DB_TRX_ID`（最近修改事务 ID）、`DB_ROLL_PTR`（回滚指针，指向 Undo Log）、`DB_ROW_ID`（隐式主键）。
  - **Undo Log 版本链**：每次更新将旧数据写入 Undo Log，通过 `DB_ROLL_PTR` 串成历史版本链。
  - **ReadView（一致性视图）**：记录当前活跃事务列表及边界（`m_ids`、`min_trx_id`、`max_trx_id`、`creator_trx_id`），查询时对比 `DB_TRX_ID` 判断版本是否可见，不可见则顺着版本链回溯。
- **RC 与 RR 区别**：RC 每次 `SELECT` 都会生成新 ReadView；RR 仅在事务第一次 `SELECT` 时生成并复用。

2、timewait比较多的现象是什么，怎么解决

- **现象**：大量主动关闭的连接停留在 `TIME_WAIT` 状态（持续 2MSL），导致**本地临时端口耗尽**，无法建立新对外连接（报错 `Cannot assign requested address`），并占用内存与句柄。
- **原因**：高频短连接且由本端主动发起关闭（如未启用连接池调用下游）。
- **解决办法**：
  1. **架构优化（根本）**：使用**长连接与连接池**（HTTP Keep-Alive、DB/Redis 连接池），尽量让客户端主动断开。
  2. **内核调优**：开启 `net.ipv4.tcp_tw_reuse = 1`（复用出向连接）与 `tcp_timestamps = 1`；扩大端口范围 `ip_local_port_range`；适当调大 `tcp_max_tw_buckets`（注意 Linux 4.12+ 已移除 `tcp_tw_recycle`）。

3、postgreSQL和Mysql的选择

- **MySQL**：生态最成熟、高并发简单读写（OLTP）性能极佳、主从与分库分表方案完善；弱点是复杂 SQL 与分析能力偏弱。适合常规互联网高并发业务。
- **PostgreSQL**：SQL 标准兼容性极好、复杂查询优化器强；原生支持丰富扩展（JSONB、GIS 地理信息、pgvector 向量检索）；弱点是频繁更新易产生表膨胀（依赖 autovacuum）、多进程模型高并发连接需搭配 PgBouncer。适合复杂查询、数据分析（HTAP）、GIS 及 AI 向量场景。

4、重写和重载

- **重载（Overload）**：发生在**同一个类**内，方法名相同但**参数列表不同**（类型/个数/顺序），与返回值无关。属于**编译时多态**。
- **重写（Override）**：发生在**父子类继承/接口实现**中，方法名与参数列表**完全相同**，访问权限不能更严、抛出异常不能更宽、返回值兼容。属于**运行时多态**。

5、进程通信方式：

- **管道**：匿名管道（仅父子/兄弟进程）、命名管道 FIFO（可用于无亲缘进程）。
- **信号（Signal）**：异步通知机制，只能传信号量级状态，不能传大量数据。
- **消息队列**：内核中结构化消息链表，可按类型读取，存在内核态与用户态拷贝开销。
- **共享内存**：多进程映射同一物理内存，**速度最快**（零拷贝），需配合信号量保证并发安全。
- **信号量（Semaphore）**：计数器，主要用于进程间同步与互斥，不传业务数据。
- **Socket**：支持本机（Unix Domain Socket）及跨网络通信。

6、线程同步方式：

- **互斥锁（Mutex）**：保证同一时刻仅一个线程进入临界区。
- **读写锁（RWLock）**：读共享、写独占，适合读多写少场景。
- **自旋锁（Spinlock）**：抢锁失败不阻塞而是忙等（CAS），减少上下文切换，适合锁粒度极小的场景。
- **条件变量（Cond）**：配合互斥锁实现条件等待与唤醒机制（如生产消费模型）。
- **信号量（Semaphore）**：控制同时访问资源的线程数上限。
- **原子操作（Atomic / CAS）**：CPU 指令级无锁并发。
- **同步辅助/通信原语**：如 Go `Channel`、`WaitGroup`，Java `CountDownLatch`、`CyclicBarrier`。

### 11.24 大疆一面

500美刀 / 月 + 免费开源

全是场景题，就不说了

1、接口超时的原因一般有哪些

- **网络与连接层**：网络抖动/丢包、跨地域高延迟、DNS 解析慢、连接池耗尽导致等待超时。
- **数据库与缓存瓶颈**：慢 SQL（未走索引、全表扫描）、锁等待/死锁、连接池打满；缓存击穿/雪崩打挂 DB、Redis 大 Key/热 Key 阻塞。
- **服务自身资源问题**：CPU 飙高（死循环/正则回溯）、频繁 Full GC（STW 停顿）、线程池打满或线程死锁。
- **下游依赖拖垮**：调用第三方/下游微服务超时且未做隔离与熔断，导致级联阻塞。
- **数据与配置问题**：未分页返回超大报文（序列化与传输耗时）、超时阈值配置过短。

### 11.24 为恒智能科技（无锡）一面

20美刀 / 月 + 免费开源

### 11.25 海信云平台一面

### 11.26 可镭技术

最后问我设计公司的模型的容量刷新用什么方式比较好，每天定时刷新还是5小时刷新。

### 11.26 海信二面

大领导 + HR
