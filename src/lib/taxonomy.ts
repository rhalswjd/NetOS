export const networkLayers = [
  {
    id: 'l7',
    name: 'Application',
    number: 7,
    description: 'Network services that applications use to communicate.',
    keywords: ['DHCP', 'HTTP', 'DNS', 'SMTP'],
  },
  {
    id: 'l6',
    name: 'Presentation',
    number: 6,
    description: 'Representing, encoding, and transforming application data.',
    keywords: ['Encoding', 'Compression', 'Encryption'],
  },
  {
    id: 'l5',
    name: 'Session',
    number: 5,
    description: 'Establishing and managing dialogues between applications.',
    keywords: ['Sessions', 'RPC', 'Checkpoints'],
  },
  {
    id: 'l4',
    name: 'Transport',
    number: 4,
    description:
      'End-to-end delivery, multiplexing, and transport reliability.',
    keywords: ['TCP', 'UDP', 'Reliability'],
  },
  {
    id: 'l3',
    name: 'Network',
    number: 3,
    description: 'Logical addressing and forwarding across networks.',
    keywords: ['IP', 'Routing', 'ICMP'],
  },
  {
    id: 'l2',
    name: 'Data Link',
    number: 2,
    description: 'Frames and local-link delivery between neighboring nodes.',
    keywords: ['Ethernet', 'MAC', 'Switching'],
  },
  {
    id: 'l1',
    name: 'Physical',
    number: 1,
    description: 'Sending bits as physical signals through a medium.',
    keywords: ['Bits', 'Signals', 'Media'],
  },
] as const;
export const osAreas = [
  {
    id: 'fundamentals',
    name: 'Fundamentals / System Calls',
    description:
      'The kernel, privilege boundaries, and the interface exposed to applications.',
    keywords: ['Kernel', 'System calls', 'Protection'],
  },
  {
    id: 'processes',
    name: 'Processes & Threads',
    description:
      'Execution contexts, process isolation, and the lifecycle of a running program.',
    keywords: ['Processes', 'Threads', 'Context switches'],
  },
  {
    id: 'scheduling',
    name: 'CPU Scheduling',
    description: 'Choosing which runnable task gets time on a processor.',
    keywords: ['Run queues', 'Fairness', 'Latency'],
  },
  {
    id: 'synchronization',
    name: 'Synchronization & Deadlocks',
    description:
      'Coordinating concurrent work and reasoning about resource contention.',
    keywords: ['Locks', 'Semaphores', 'Deadlocks'],
  },
  {
    id: 'memory',
    name: 'Memory Management',
    description: 'Allocating and tracking physical memory and kernel memory.',
    keywords: ['Allocation', 'Pages', 'Physical memory'],
  },
  {
    id: 'virtual-memory',
    name: 'Virtual Memory',
    description:
      'Mapping virtual address spaces onto physical memory and backing storage.',
    keywords: ['Page tables', 'TLB', 'Page faults'],
  },
  {
    id: 'file-systems',
    name: 'File Systems',
    description: 'Organizing persistent data, names, metadata, and access.',
    keywords: ['Inodes', 'Directories', 'Persistence'],
  },
  {
    id: 'io',
    name: 'I/O & Device Drivers',
    description:
      'Mediating access to devices through drivers, interrupts, and I/O interfaces.',
    keywords: ['Drivers', 'Interrupts', 'Devices'],
  },
] as const;
export const taxonomy = { network: networkLayers, os: osAreas };
export type Domain = keyof typeof taxonomy;
export const documentTypes = [
  {
    type: 'concept',
    slug: 'concepts',
    label: 'Concepts',
    korean: '개념 정리',
    icon: 'book',
    description: 'Build understanding, one idea at a time.',
  },
  {
    type: 'lab',
    slug: 'labs',
    label: 'Labs',
    korean: '실험 기록',
    icon: 'flask',
    description: 'Make an observation. Test an assumption.',
  },
  {
    type: 'research',
    slug: 'research',
    label: 'Research',
    korean: '연구·탐구',
    icon: 'compass',
    description: 'Follow a question a little further.',
  },
  {
    type: 'problem',
    slug: 'problems',
    label: 'Problems',
    korean: '문제·해설',
    icon: 'file',
    description: 'Turn knowledge into a way of thinking.',
  },
] as const;
export function categoryFor(domain: Domain, id: string) {
  return taxonomy[domain].find((c) => c.id === id);
}
export function categoryPath(domain: Domain, id: string) {
  return domain === 'network' ? `/network/layers/${id}/` : `/os/areas/${id}/`;
}
