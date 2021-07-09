const sizeDataNoTagSemVerSort = [
  { name: 'master', full_size: 13449470 },
  { name: 'feature-smtps-support', full_size: 13449638 },
  { name: 'latest', full_size: 13448411 },
  { name: '4', full_size: 13448411 },
  { name: '4.3', full_size: 13448411 },
  { name: '4.3.0', full_size: 13448411 },
  { name: '4.2', full_size: 13443674 },
  { name: '4.2.0', full_size: 13443674 },
  { name: '4.1', full_size: 19244435 },
  { name: '4.1.0', full_size: 19244435 },
  { name: 'v4.0.0-alpha2', full_size: 10933605 },
  { name: 'v4.0.0-alpha1', full_size: 10933644 },
  { name: '4.0.0', full_size: 11512227 },
  { name: '4.0', full_size: 11512227 },
  { name: 'v2.1.9', full_size: 29739490 },
  { name: 'v2.1.10', full_size: 29739842 },
  { name: 'v3.0.0', full_size: 32882980 },
  { name: 'v3.0.1', full_size: 32880923 },
  { name: 'v3.1.0', full_size: 32441549 },
  { name: 'v3.1.1', full_size: 32441767 },
  { name: 'v3.1.2', full_size: 32442741 },
  { name: 'v3.1.3', full_size: 32442629 },
  { name: 'v3.1.4', full_size: 32478607 },
  { name: 'v3.2.0', full_size: 33489914 },
  { name: 'v3.3.0', full_size: 33628545 },
  { name: 'v3.3.1', full_size: 33629018 },
  { name: 'v3.3.3', full_size: 33628988 },
  { name: 'v3.3.4', full_size: 33629019 },
  { name: 'v3.3.6', full_size: 33628753 },
  { name: 'v3.3.7', full_size: 33629556 },
  { name: 'v3.3.8', full_size: 33644261 },
  { name: 'v3.3.9', full_size: 33644175 },
  { name: 'v3.3.10', full_size: 33644406 },
  { name: 'v3.3.11', full_size: 33644430 },
  { name: 'v3.3.12', full_size: 33644703 },
  { name: 'v3.3.13', full_size: 33644377 },
  { name: 'v3.3.15', full_size: 33644581 },
  { name: 'v3.3.16', full_size: 33644663 },
  { name: 'v3.3.17', full_size: 33644228 },
  { name: 'v3.3.18', full_size: 33644466 },
  { name: 'v3.3.19', full_size: 33644724 },
  { name: 'v3.4.0', full_size: 34918552 },
  { name: 'v3.4.2', full_size: 33605129 },
  { name: 'v3.5.0', full_size: 33582915 },
  { name: 'v3.6.0', full_size: 34789944 },
  { name: 'develop', full_size: 38129308 },
  { name: 'v3.7.0', full_size: 38179583 },
  { name: 'v3.7.1', full_size: 38614944 },
  { name: 'v3.8.0', full_size: 42962384 },
  { name: 'v3.8.1', full_size: 40000713 },
  { name: 'v3.8.2', full_size: 40000567 },
  { name: 'v3.8.3', full_size: 40040963 },
  { name: 'v3.9.0', full_size: 40044357 },
  { name: 'v3.9.1', full_size: 40048123 },
  { name: 'v3.9.2', full_size: 40047663 },
  { name: 'v3.9.3', full_size: 40048204 },
  { name: 'v3.9.4', full_size: 40049571 },
  { name: 'v3.9.5', full_size: 40049695 },
  { name: 'v3.10.0', full_size: 39940736 },
  { name: 'v3.11.0', full_size: 39928170 },
  { name: 'v3.12.0', full_size: 39966770 },
  { name: 'v3.13.0', full_size: 38556045 },
  { name: 'v3.14.0', full_size: 38574008 },
  { name: 'v3.15.0', full_size: 38578507 },
  { name: 'v3.16.0', full_size: 38852598 },
  { name: 'v3.16.1', full_size: 38851702 },
  { name: 'v3.16.2', full_size: 38969822 },
]
const versionDataNoTagDateSort = {
  count: 4,
  results: [
    {
      name: 'latest',
      images: [
        {
          digest:
            'sha256:6bdb610acd12a4446d6dd839ebf8c2927c8e6bbde8b7beb2562d1f7f7c4437fb',
          architecture: 'arm64',
        },
        {
          digest:
            'sha256:4070dd02827ed3545acb745de3b567a42b87828bb842181e80a2b69f6e3b37b2',
          architecture: 'amd64',
        },
        {
          digest:
            'sha256:6f21523ebe450faa23e688b7ea3556ddf4415032263a80ad1f1543463098a779',
          architecture: 'arm',
        },
      ],
    },
    {
      name: 'arm64v8-latest',
      images: [
        {
          digest:
            'sha256:6bdb610acd12a4446d6dd839ebf8c2927c8e6bbde8b7beb2562d1f7f7c4437fb',
          architecture: 'amd64',
        },
      ],
    },
    {
      name: 'arm32v7-latest',
      images: [
        {
          digest:
            'sha256:6f21523ebe450faa23e688b7ea3556ddf4415032263a80ad1f1543463098a779',
          architecture: 'amd64',
        },
      ],
    },
    {
      name: 'amd64-latest',
      images: [
        {
          digest:
            'sha256:4070dd02827ed3545acb745de3b567a42b87828bb842181e80a2b69f6e3b37b2',
          architecture: 'amd64',
        },
      ],
    },
  ],
}
const versionPagedDataNoTagDateSort = [
  {
    name: 'latest',
    images: [
      {
        digest:
          'sha256:6bdb610acd12a4446d6dd839ebf8c2927c8e6bbde8b7beb2562d1f7f7c4437fb',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:4070dd02827ed3545acb745de3b567a42b87828bb842181e80a2b69f6e3b37b2',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:6f21523ebe450faa23e688b7ea3556ddf4415032263a80ad1f1543463098a779',
        architecture: 'arm',
      },
    ],
  },
  {
    name: 'arm64v8-latest',
    images: [
      {
        digest:
          'sha256:6bdb610acd12a4446d6dd839ebf8c2927c8e6bbde8b7beb2562d1f7f7c4437fb',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: 'arm32v7-latest',
    images: [
      {
        digest:
          'sha256:6f21523ebe450faa23e688b7ea3556ddf4415032263a80ad1f1543463098a779',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: 'amd64-latest',
    images: [
      {
        digest:
          'sha256:4070dd02827ed3545acb745de3b567a42b87828bb842181e80a2b69f6e3b37b2',
        architecture: 'amd64',
      },
    ],
  },
]
const versionDataNoTagSemVerSort = [
  {
    name: '3.9.5',
    images: [
      {
        digest:
          'sha256:fa5361fbf636d3ac50cb529dab20d810eb466de2079f5710cef4cbada29cf499',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:97e9e9a15ef94526018e2fabfdfff14781e58b87f989d2e70543f296dcad26c6',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:cae6522b6a351615e547ae9222c9a05d172bc5c3240eec03072d4e1d0429a17a',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:5292cebaf695db860087c5582d340a406613891b2819092747b0388da47936c8',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:0c6b515386fda00a17e4653f007979825f35e0086e583ddc9b91d3eda941bd1b',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:c7b3e8392e08c971e98627e2bddd10c7fa9d2eae797a16bc94de9709bb9300d0',
        architecture: '386',
      },
      {
        digest:
          'sha256:ab3fe83c0696e3f565c9b4a734ec309ae9bd0d74c192de4590fd6dc2ef717815',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.9',
    images: [
      {
        digest:
          'sha256:ab3fe83c0696e3f565c9b4a734ec309ae9bd0d74c192de4590fd6dc2ef717815',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:c7b3e8392e08c971e98627e2bddd10c7fa9d2eae797a16bc94de9709bb9300d0',
        architecture: '386',
      },
      {
        digest:
          'sha256:5292cebaf695db860087c5582d340a406613891b2819092747b0388da47936c8',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:97e9e9a15ef94526018e2fabfdfff14781e58b87f989d2e70543f296dcad26c6',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:0c6b515386fda00a17e4653f007979825f35e0086e583ddc9b91d3eda941bd1b',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:fa5361fbf636d3ac50cb529dab20d810eb466de2079f5710cef4cbada29cf499',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:cae6522b6a351615e547ae9222c9a05d172bc5c3240eec03072d4e1d0429a17a',
        architecture: 'arm64',
      },
    ],
  },
  {
    name: '3.8.5',
    images: [
      {
        digest:
          'sha256:954b378c375d852eb3c63ab88978f640b4348b01c1b3456a024a81536dafbbf4',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:e802987f152d7826cf929ad4999fb3bb956ce7a30966aeb46c749f9120eaf22c',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:cf35b4fa14e23492df67af08ced54a15e68ad00cac545b437b1994340f20648c',
        architecture: '386',
      },
      {
        digest:
          'sha256:402d21757a03a114d273bbe372fa4b9eca567e8b6c332fa7ebf982b902207242',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:dabea2944dcc2b86482b4f0b0fb62da80e0673e900c46c0e03b45919881a5d84',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:514ec80ffbe1a2ab1d9a3d5e6082296296a1d8b6870246edf897228e5df2367d',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '3.8',
    images: [
      {
        digest:
          'sha256:e802987f152d7826cf929ad4999fb3bb956ce7a30966aeb46c749f9120eaf22c',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:954b378c375d852eb3c63ab88978f640b4348b01c1b3456a024a81536dafbbf4',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:cf35b4fa14e23492df67af08ced54a15e68ad00cac545b437b1994340f20648c',
        architecture: '386',
      },
      {
        digest:
          'sha256:514ec80ffbe1a2ab1d9a3d5e6082296296a1d8b6870246edf897228e5df2367d',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:dabea2944dcc2b86482b4f0b0fb62da80e0673e900c46c0e03b45919881a5d84',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:402d21757a03a114d273bbe372fa4b9eca567e8b6c332fa7ebf982b902207242',
        architecture: 'ppc64le',
      },
    ],
  },
  {
    name: '3.10.4',
    images: [
      {
        digest:
          'sha256:747f335d2f685dcdd08813d2302e62a370285c5a8c86bdf152ec993e2f20a7af',
        architecture: '386',
      },
      {
        digest:
          'sha256:4491fd429b8ad188ba5e120782b2bbb704261fd2ef9942fcdee128c5fcc594d5',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:216161924b520a8b99ec0130da5ce39aa1876ed3dd0199df50e16564c7bbf938',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:de78803598bc4c940fc4591d412bffe488205d5d953f94751c6308deeaaa7eb8',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:2632d6288d34d7175021683f6e363fa7c0fa8866a565eb285e36e3b856545e82',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:9afbfccb806687f6979661622f0c04dc534769e742465b107f84a830cbb8e77a',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:33158d51a7a549207e508a42bf46493f23e1e99fbc011eb3f3742e8b349a2be9',
        architecture: 'ppc64le',
      },
    ],
  },
  {
    name: '3.10',
    images: [
      {
        digest:
          'sha256:33158d51a7a549207e508a42bf46493f23e1e99fbc011eb3f3742e8b349a2be9',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:747f335d2f685dcdd08813d2302e62a370285c5a8c86bdf152ec993e2f20a7af',
        architecture: '386',
      },
      {
        digest:
          'sha256:4491fd429b8ad188ba5e120782b2bbb704261fd2ef9942fcdee128c5fcc594d5',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:2632d6288d34d7175021683f6e363fa7c0fa8866a565eb285e36e3b856545e82',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:9afbfccb806687f6979661622f0c04dc534769e742465b107f84a830cbb8e77a',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:216161924b520a8b99ec0130da5ce39aa1876ed3dd0199df50e16564c7bbf938',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:de78803598bc4c940fc4591d412bffe488205d5d953f94751c6308deeaaa7eb8',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: 'edge',
    images: [
      {
        digest:
          'sha256:7b5953e862c998ef1ece3c142df8ae977162e6f30eecef40b4ef393d499f6124',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:e3e522f1325346cf70f03901b26a5a01eb0c73a73d706a16ecfadc0d9583070f',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:cb3bf0adee8921084ef941d9499e92097f4291a2a81d668da1428e62422518db',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:fb7bea212348f9f7b681815f157118fa58677f581f50c1df8ccc32af3e1037b1',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:5f60bf03cace5b582fbe43145f59e8c6295c6965d1b07cdf969f038a2685d4e8',
        architecture: '386',
      },
      {
        digest:
          'sha256:e137ff293fccbe890ba2e4adc6346fd38658ad5be8f867fb84a0ea4d96b46690',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:9898e9a51db3e20a557fe0b2a60494b97200d31f580796e664f126a24ec487cd',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '20200122',
    images: [
      {
        digest:
          'sha256:9898e9a51db3e20a557fe0b2a60494b97200d31f580796e664f126a24ec487cd',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:5f60bf03cace5b582fbe43145f59e8c6295c6965d1b07cdf969f038a2685d4e8',
        architecture: '386',
      },
      {
        digest:
          'sha256:fb7bea212348f9f7b681815f157118fa58677f581f50c1df8ccc32af3e1037b1',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:7b5953e862c998ef1ece3c142df8ae977162e6f30eecef40b4ef393d499f6124',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:cb3bf0adee8921084ef941d9499e92097f4291a2a81d668da1428e62422518db',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:e3e522f1325346cf70f03901b26a5a01eb0c73a73d706a16ecfadc0d9583070f',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:e137ff293fccbe890ba2e4adc6346fd38658ad5be8f867fb84a0ea4d96b46690',
        architecture: 'arm',
      },
    ],
  },
  {
    name: 'latest',
    images: [
      {
        digest:
          'sha256:4d5c5951669588e23881c158629ae6bac4ab44866d5b4d150c3f15d91f26682b',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:401f030aa35e86bafd31c6cc292b01659cbde72d77e8c24737bd63283837f02c',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ef20eb43010abda2d7944e0cd11ef00a961ff7a7f953671226fbf8747895417d',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:c40c013324aa73f430d33724d8030c34b1881e96b23f44ec616f1caf8dbf445f',
        architecture: '386',
      },
      {
        digest:
          'sha256:2c26a655f6e38294e859edac46230210bbed3591d6ff57060b8671cda09756d4',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ff8a6adf5859433869343296f1b06e0a7bdf4fc836b08d5854221e351baf6929',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:ddba4d27a7ffc3f86dd6c2f92041af252a1f23a8e742c90e6e1297bfa1bc0c45',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.11.3',
    images: [
      {
        digest:
          'sha256:401f030aa35e86bafd31c6cc292b01659cbde72d77e8c24737bd63283837f02c',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ddba4d27a7ffc3f86dd6c2f92041af252a1f23a8e742c90e6e1297bfa1bc0c45',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:ef20eb43010abda2d7944e0cd11ef00a961ff7a7f953671226fbf8747895417d',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:2c26a655f6e38294e859edac46230210bbed3591d6ff57060b8671cda09756d4',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:c40c013324aa73f430d33724d8030c34b1881e96b23f44ec616f1caf8dbf445f',
        architecture: '386',
      },
      {
        digest:
          'sha256:4d5c5951669588e23881c158629ae6bac4ab44866d5b4d150c3f15d91f26682b',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:ff8a6adf5859433869343296f1b06e0a7bdf4fc836b08d5854221e351baf6929',
        architecture: 'ppc64le',
      },
    ],
  },
  {
    name: '3.11',
    images: [
      {
        digest:
          'sha256:401f030aa35e86bafd31c6cc292b01659cbde72d77e8c24737bd63283837f02c',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:c40c013324aa73f430d33724d8030c34b1881e96b23f44ec616f1caf8dbf445f',
        architecture: '386',
      },
      {
        digest:
          'sha256:2c26a655f6e38294e859edac46230210bbed3591d6ff57060b8671cda09756d4',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ff8a6adf5859433869343296f1b06e0a7bdf4fc836b08d5854221e351baf6929',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:ddba4d27a7ffc3f86dd6c2f92041af252a1f23a8e742c90e6e1297bfa1bc0c45',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:4d5c5951669588e23881c158629ae6bac4ab44866d5b4d150c3f15d91f26682b',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:ef20eb43010abda2d7944e0cd11ef00a961ff7a7f953671226fbf8747895417d',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '3',
    images: [
      {
        digest:
          'sha256:401f030aa35e86bafd31c6cc292b01659cbde72d77e8c24737bd63283837f02c',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:2c26a655f6e38294e859edac46230210bbed3591d6ff57060b8671cda09756d4',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:c40c013324aa73f430d33724d8030c34b1881e96b23f44ec616f1caf8dbf445f',
        architecture: '386',
      },
      {
        digest:
          'sha256:ef20eb43010abda2d7944e0cd11ef00a961ff7a7f953671226fbf8747895417d',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:ddba4d27a7ffc3f86dd6c2f92041af252a1f23a8e742c90e6e1297bfa1bc0c45',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:ff8a6adf5859433869343296f1b06e0a7bdf4fc836b08d5854221e351baf6929',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:4d5c5951669588e23881c158629ae6bac4ab44866d5b4d150c3f15d91f26682b',
        architecture: 'arm64',
      },
    ],
  },
  {
    name: '3.11.2',
    images: [
      {
        digest:
          'sha256:ba07bedf11ebc316ec7c12a7adb791971535cc3e21c69576db706b5b736b813e',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:892105a25acfbcb693eba42428b5a7daa63e20a1b1c85bd225ef36f447db9182',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:4782ed3b32fa6d0dc526f7772172a86445168320c2aebde5a7017c2e229bbf10',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:50cd675002032820d09a38c4d4df25d19a8814b4b38855090a27434a33609066',
        architecture: '386',
      },
      {
        digest:
          'sha256:e1138bb27b6d4fd0b871bef09503dd9a143ecc96dce2126bf88c520e0ea998bb',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:3983cc12fb9dc20a009340149e382a18de6a8261b0ac0e8f5fcdf11f8dd5937e',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:bf9ea7e74684d7ffbf167130740177e680ae4770e3e00da710eb567edb15b26c',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '3.11.0',
    images: [
      {
        digest:
          'sha256:d965afc5cd134c484d26a74aca4592b843cc7f3349af63498535f5486f28bb60',
        architecture: '386',
      },
      {
        digest:
          'sha256:f360950221f8f53d6242c61ae0e22cd779d5d1f5caceb599a3502fa03ac26e31',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:aec3cf8ea78f690acc18450304f23e9dae4cc33d346597eb036e33a66d8da085',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:9026e194fffefc65996f84fdfd9d0fc48d17f455c0191d4652a73fa0555c4142',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:d371657a4f661a854ff050898003f4cb6c7f36d968a943c1d5cde0952bd93c80',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:f61a0c3c620b07b22610d464040e773ea57773025330b5c8c448bc83d7222820',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:663e0e4b1049b52d60fe01799a2aedc875bd18f555c88e4b7ba2377927c1db36',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '20191219',
    images: [
      {
        digest:
          'sha256:147b00fcf6fc7b701b6ea9aae2b2436483b68b97a59b2bf64383084dd6d2d58f',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:1a4839802b9242aa55b309ad469e0dd77d0a88a48e432f950d1319f944ce5e8b',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:abe500b56242b1b762f9de2fe066d2520640541a04c821f56ac240605e447f88',
        architecture: '386',
      },
      {
        digest:
          'sha256:e0851153cb8e20ad43e0bab92fb6c8a1bdb4afabc1ea8329863b55a663ccecc3',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:b837b9420bb4f67956da5bb9103cfb43917004a9e2715e5197c9b9a74d222233',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:423f0b0c44a8e4da4c7f64b7ffba0d6391e847a82d0b759bcaae5a1f81bf3d42',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:5b94d101a874c5355bd02b05a1a81d26ae63e43234926bf6d951ef02d8f110f9',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '20191114',
    images: [
      {
        digest:
          'sha256:4cacc7777b719f9257c3a6bdf750c8eda7a3932d94d6f8f44b72979b50046268',
        architecture: '386',
      },
      {
        digest:
          'sha256:5c3e629993b44387888c98f1c80f81381226e36938e790a8a38ed2b08a5f51ac',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:6f5b5d6bee15fa8b0e8690890c2ed9784edb2a23a3bddf3e9b767d7afb38b03a',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:2817069dcebecf0363073d8cba05a398aef599de22d114cfd3e6a314a17e7756',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:63f10f6f38e4471b044d318ac0b0768fbc7c46e6bbfd0787b58de8ba43496b50',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:81a04d8e480e002eab2116c33d88c09ea9902c5857c02ba96fbc15c5cde4d6a6',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:6b4a5423c7c0b11a76ca14f86c4c3723239ec717a56c19a56d6f26474f9cc690',
        architecture: 'ppc64le',
      },
    ],
  },
  {
    name: '3.10.3',
    images: [
      {
        digest:
          'sha256:29a82d50bdb8dd7814009852c1773fb9bb300d2f655bd1cd9e764e7bb1412be3',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:1827be57ca85c28287d18349bbfdb3870419692656cb67c4cd0f5042f0f63aec',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:77cbe97593c890eb1c4cadcbca37809ebff2b5f46a036666866c99f08a708967',
        architecture: '386',
      },
      {
        digest:
          'sha256:915a0447d045e3b55f84e8456de861571200ee39f38a0ce70a45f91c29491a21',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:e4355b66995c96b4b468159fc5c7e3540fcef961189ca13fee877798649f531a',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:6dff84dbd39db7cb0fc928291e220b3cff846e59334fd66f27ace0bcfd471b75',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:d8d321ec5eec88dee69aec467a51fe764daebdb92ecff0d1debd09840cbd86c6',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '20190925',
    images: [
      {
        digest:
          'sha256:d047b0686c3c2612c142d67410b2e0f440de5c03dd3dbf96f40987ad65d3125e',
        architecture: '386',
      },
      {
        digest:
          'sha256:fce1d670e6d1dfd6a893ba8e1fd4647d13e8c13f8832901dfc58e07e0662dd3a',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:6ebfb9f5d26acee346776ac8569e515cb447fba5f12fe89b76a6e6e6d1f18a8c',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:fcba4b2bd9b151cc94c0407982f7df094f99bb5c3bc27008b6248f822039ee80',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:b59cc32d2e7ebedf81d0614dd87a87c6f9f8d74b8418722a9a52adbe9eeb2b7a',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:d0cd29c3b39680f9673f1f0cff4dfbeb65202d47577d9fe38491e76895adcbb4',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:6b53bb87c752dfb006c8a4746f5dafcf1d121d53d569dd450dffceacfce66a33',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.10.2',
    images: [
      {
        digest:
          'sha256:499416c8a5bcb311d75e12fb4667886e32b43aaf11003be2a334cbe265e81ce4',
        architecture: '386',
      },
      {
        digest:
          'sha256:5abbfe2915ad8c466bf6c9f33d03622cde0298c36cd88f55d16a3aa3d9c2c35e',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:43955d6857268cc948ae9b370b221091057de83c4962da0826f9a2bdc9bd6b44',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:db7f3dcef3d586f7dd123f107c93d7911515a5991c4b9e51fa2a43e46335a43e',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:acd3ca9941a85e8ed16515bfc5328e4e2f8c128caa72959a58a127b7801ee01f',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:1316a4e4b2361242457f4136cc409c38e8a48ffda76e4e1be31896006e5fc4a2',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:0489474da8ea22426ece86ace6c1c0026ab2fd3cdfbbd62b7e94650266c37d9a',
        architecture: 'arm',
      },
    ],
  },
  {
    name: '3.8.4',
    images: [
      {
        digest:
          'sha256:360e20fc240529450cf378756935230541da805701e3ff895305b72f37ce4d9c',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:899a03e9816e5283edba63d71ea528cd83576b28a7586cf617ce78af5526f209',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:26a8d1303ea6109122ba2df7fafcfbe77ddc3988a2c34e818398b8ed4a20b03d',
        architecture: '386',
      },
      {
        digest:
          'sha256:4446f81140f30b7041ac1984e8cb1fcab2b50357ccf67780147505ef4a136c89',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:30430986cdd82266d148bc4911859c3160c9577b993633908a572339978a52a9',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:f29c3d10359dd0e6d0c11e4f715735b678c0ab03a7ac4565b4b6c08980f6213b',
        architecture: 'arm',
      },
    ],
  },
  {
    name: '20190809',
    images: [
      {
        digest:
          'sha256:4edcccc2f87d4c79945a1579387abf0392b1639b606cdfb90fb4718223f9bb5f',
        architecture: '386',
      },
      {
        digest:
          'sha256:783ffbd8e3701ffe28ddffaf9c3a26249cee5108b471229cc32bcb99e892e08f',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:5bb71492bc8c0b935c8d609eb1d47ceda27bf899af02d2d72eb4142f35a03675',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:f01913bcc3593cad3786f632239100ff7616ff5a4ba88bf3065018d7b64f9b80',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:f22000e09b6a017c77e6c95418b5a331c79399055a15c3712fd41dfa889b2d67',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:9928890987d7ed2551cf1e426339c30eb0cbac9922858ed6adf1b98eff83b998',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:dae909606f734c78971984316fbd8a68541feb33bf703a01621d7d8ffd47e7a9',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.10.1',
    images: [
      {
        digest:
          'sha256:d69be64353c91f02fbccbad56e545122636a02d2ee1c9ffa99a6219a8d4d9f73',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:b206388a8e17c4a9c8e1c0d8f28dde06632dee48ac8409a6e5460280f978f593',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:c540a864de9947de37986965a796751279904c3b8c0f4e487fa9cf52f6372079',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:afd6ffe2b877c475f697a2c19b9f23f97d21e176c652e91f028d9400e21f8617',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:fa56b4f2cbe6498fb15be09b0e026b61d1883bf0550f0770c6193a40da12425b',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ef77e1079a17df210045ffa5dc19214ccdb89e001f32ffab2e61a1c743c2aec7',
        architecture: '386',
      },
      {
        digest:
          'sha256:57334c50959f26ce1ee025d08f136c2292c128f84e7b229d1b0da5dac89e9866',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '20190707',
    images: [
      {
        digest:
          'sha256:1b04d9c73a8c52ce1df93b351f3517eaf24730bf751f1d547fd04bd1e41720f6',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:272f00157687c245c28e546f5d106a2496d92883c35275113684e24a24aeef6d',
        architecture: '386',
      },
      {
        digest:
          'sha256:a9e1483e9ea23ba640ad9cd2949fc7c9dcc00e2b789d538505207c7d8f1637f3',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:8263fe7c497089bc195d119be3a617f99f9f0121af759bfb5ec32bd914c55bcd',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:d108a8892b77b9e3d1ca0e3bcfb9c1f86fa4ba0a7a56f5af9e1571ed27458f3c',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:c04b643dedaccae53e036f2bf72b0e792870f51708aff6ceaa6895de60e46257',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:f88c7a97db3630d64d75916ee7ee694f7f95a9c9a0bd997abf1c9a5812f83894',
        architecture: 'arm64',
      },
    ],
  },
  {
    name: '3.9.4',
    images: [
      {
        digest:
          'sha256:bf1684a6e3676389ec861c602e97f27b03f14178e5bc3f70dce198f9f160cce9',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:d438d3b6a72b602b70bd259ebfb344e388d8809c5abf691f6de397de8c9e4572',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:1be52adf0390937540f21f66fb8dc4c155b3a0325e380001be08fd5923359e81',
        architecture: '386',
      },
      {
        digest:
          'sha256:1032bdba4c5f88facf7eceb259c18deb28a51785eb35e469285a03eba78dd3fc',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:cb238aa5b34dfd5e57ddfb1bfbb564f01df218e6f6453e4036b302e32bca8bb5',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:f6d15ec5c7cf08079309c59f59ff1e092eb9a678ab891257b1d2b118e7aecc2b',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:fc6ad107f85e5210d7cbbdb00b6af0b8b1c94a2b0cecc77db19e853b87cd549e',
        architecture: 'arm',
      },
    ],
  },
  {
    name: '3.7.3',
    images: [
      {
        digest:
          'sha256:c51b8029218660b67e5513ae1945f9fcd11cb8f4fa536e8a66f1566f68c81ade',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ab1f6f59e27b660c2d5a8416cd9ebbb15532a368e828537218819ee77ee54658',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:07d69855442f842117e85f24b58ba7cdd54166281d48fa05c58b6b79599d2181',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:bd9fbba517359ec529587753ea1153072c08ada74a8c3fbcbd81dd6421047cb3',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:90048fac253b6c28722c6fd725af0b3232c20ac6369d6d7bc4f9f96dced14de3',
        architecture: '386',
      },
      {
        digest:
          'sha256:92251458088c638061cda8fd8b403b76d661a4dc6b7ee71b6affcf1872557b2b',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.7',
    images: [
      {
        digest:
          'sha256:c51b8029218660b67e5513ae1945f9fcd11cb8f4fa536e8a66f1566f68c81ade',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:92251458088c638061cda8fd8b403b76d661a4dc6b7ee71b6affcf1872557b2b',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:ab1f6f59e27b660c2d5a8416cd9ebbb15532a368e828537218819ee77ee54658',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:bd9fbba517359ec529587753ea1153072c08ada74a8c3fbcbd81dd6421047cb3',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:07d69855442f842117e85f24b58ba7cdd54166281d48fa05c58b6b79599d2181',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:90048fac253b6c28722c6fd725af0b3232c20ac6369d6d7bc4f9f96dced14de3',
        architecture: '386',
      },
    ],
  },
  {
    name: '3.10.0',
    images: [
      {
        digest:
          'sha256:67c5653165b7435056dc66116cf397de88ab9a78d91da4f58ded69d268c5a0ac',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:6e8a04da457c3a62a2e3d4ecff45c990dd741e1192e97aa86fc734d2c348ed20',
        architecture: '386',
      },
      {
        digest:
          'sha256:6aafb1cd153b876ded81f273524ec54a9b4869fc5aecb739f2a625fe40d51caf',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:cb461feb0da34722454f1f5838ca678bb54b2b16216395aa9b80d7a32ff21816',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:617547cc8356dc45d8c1ca58a30052dc74c666656700529b548bac50209db05e',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:c4f32ede4ca905e0410490655b8993abb9fb77742e90a570ac28a8ca334f6c2b',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:97a042bf09f1bf78c8cf3dcebef94614f2b95fa2f988a5c07314031bc2570c7a',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '20190508',
    images: [
      {
        digest:
          'sha256:dcf512634857fc8252c6dbcaf12d4315dae50e9c54f6d08cdcc6b6be70cf3a81',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:412f64cbca6be70040e109a005aaeed7ee9c41d55e66fcf5efe8a1dfc7170fa8',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:bdd3302b00c4b9adfdc626a09061eba874ace728d6d263bb3cdfb1e0d6bc0f2a',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:65eab606c870e7bd656b220860e80ac48aeaa7be8c728a7d68d19bc1addb504a',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:2a8c37424195a515b6f7567d65896194940450c97c2137a327298cb9d930c4cb',
        architecture: '386',
      },
      {
        digest:
          'sha256:1538fe976d2cf7e6f4befe36439ad68fc825c916170db3143b05dc4df6a9962d',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:40910392cf5e22cca21935364e26569ede5f17c3d245434e53aade208f1c7023',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.6.5',
    images: [
      {
        digest:
          'sha256:43773d1dba76c4d537b494a8454558a41729b92aa2ad0feb23521c3e58cd0440',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:5d3e0daa0d346611b74cdce60d9ca335cba6bff97ed7d2eeddf83f4a839dc340',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:25e814211fdda16b4e27e1483a5dfa17d7e958b8c539ee1ee942962c5d33d6de',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:4b69660fc940a85e9c0e5c1caec59f514b0966bec394267b450282b2408f6874',
        architecture: '386',
      },
      {
        digest:
          'sha256:548ca2eca3c2ce9282c7782c9367d1c2051e28511e25f78e977a2859c3946fa7',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:8d7e7a7a8066a153edbddb0fb15f29e32dda209b5d69d5caafc52314cb30f15e',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '3.6',
    images: [
      {
        digest:
          'sha256:43773d1dba76c4d537b494a8454558a41729b92aa2ad0feb23521c3e58cd0440',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:5d3e0daa0d346611b74cdce60d9ca335cba6bff97ed7d2eeddf83f4a839dc340',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:25e814211fdda16b4e27e1483a5dfa17d7e958b8c539ee1ee942962c5d33d6de',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:4b69660fc940a85e9c0e5c1caec59f514b0966bec394267b450282b2408f6874',
        architecture: '386',
      },
      {
        digest:
          'sha256:548ca2eca3c2ce9282c7782c9367d1c2051e28511e25f78e977a2859c3946fa7',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:8d7e7a7a8066a153edbddb0fb15f29e32dda209b5d69d5caafc52314cb30f15e',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '3.9.3',
    images: [
      {
        digest:
          'sha256:b2cb61b9bc0f4be88ca9f50173023bed88daf583df11700c442812e3e346b08e',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:91ba0d6f4f61796f41ed07b5aaea6ba35b9e8da6f82ce0942ff41f04e200940a',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:cdf98d1859c1beb33ec70507249d34bacf888d59c24df3204057f9a6c758dddb',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:660030ffd296125c8af2f25a34ab2c12ac3d7656b31ac40ccf52eb14cd1c4bf0',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:98a10a4a0eb8ab9076ec7f413e34976716b989b71b2ac57e7082b3c28b884342',
        architecture: '386',
      },
      {
        digest:
          'sha256:49618257b6954e534630e7911df5030321d1a592c4070396c8150c6113684502',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:b2cb61b9bc0f4be88ca9f50173023bed88daf583df11700c442812e3e346b08e',
        architecture: 'arm',
      },
    ],
  },
  {
    name: '20190408',
    images: [
      {
        digest:
          'sha256:9115a39c7c7b43b8d8aa70d5f849b736a467137f1b69fde4bd9400fc60f3b8cc',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:b14c6d20e7a8f098867f4d3d8aea946b859be02585689be4e0879fd9457bc96e',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:3f38c53866fa6bf21451706cc9b58f108ab276ef16469b3ebb083f73d1a0c0dc',
        architecture: '386',
      },
      {
        digest:
          'sha256:fc7888a3be9a41141a887e7b82dbbe69645a2a3a70249de5a8178b01f84ad3ef',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:3cb185f08bc54c9d147ea8cf800e6ff6b2a1be466e5bad81ab5d7fb8fff94cc6',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:b34a0f0ed3f8206f21852d1dd77b8d715e1bc3c0ba93b72d6b0a0beb109ffd56',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:3e8d7a5561f04987c8cf4e25f8138f60889ba1a0e5ec2b2e7469be88e237695b',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.9.2',
    images: [
      {
        digest:
          'sha256:92dce741fcda25c45fb32400ccf765ec1947d8f77e3570626470da69b608afc0',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ef872b76f64d00bc19628b0194994d67480b5b2a2813be50fb223e79eb56dc77',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:4ece8077c7148089358a76cb9ec43c1fd92982ae4fb493980d26eec6b7605a68',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:c6029ce25b4555a61c0a0e6ddac11a9055a01d42b009567cb6615502a93c5dcf',
        architecture: '386',
      },
      {
        digest:
          'sha256:f663714dca1af21af37546a875f0146db50643d8ac894c09f4f01639cefcca6b',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:05cd2c94024fda6b368e76a5114411b893f45e14a3b0072ec5cc563104522d4c',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:5cb3aa00f89934411ffba5c063a9bc98ace875d8f92e77d0029543d9f2ef4ad0',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '20190228',
    images: [
      {
        digest:
          'sha256:778603491523f537ca4b4f8fb48884701ed055e117ae3e1a87853b7be25d5b8e',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:5e65916a4c8418b1d1eb9d50d41b962bf77a0d492d8129b83b2529b778439c62',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:6ef64e18e265364f2c635f3ba449a2aa0bc0f694e4d637382918ce8dbcad5f8c',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:7da711226313112a7e9e29efecac905250258c913d4eeb78321e79266aca243e',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:04b05b48182f1b1631abf7d96b54c124f1cee68aa2f26f184e93c3261b627fc8',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:11ca6afcbae6d138762fd7337d5c47764737c2cedc0d3718ae33c864f6556f32',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:a9f83df58a9a5481892157035a39ee1f7d281a4d28ba83a642b2452e2a93447f',
        architecture: '386',
      },
    ],
  },
  {
    name: '3.5',
    images: [
      {
        digest:
          'sha256:f80194ae2e0ccf0f098baa6b981396dfbffb16e6476164af72158577a7de2dd9',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.4',
    images: [
      {
        digest:
          'sha256:b7c5ffe56db790f91296bcebc5158280933712ee2fc8e6dc7d6c96dbb1632431',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.3',
    images: [
      {
        digest:
          'sha256:a6fc1dbfa81a7fc3119a3a28ce05d1d3f31898169603af669c75640880150de7',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.2',
    images: [
      {
        digest:
          'sha256:98f5f2d17bd1c8ba230ea9a8abc21b8d7fc8727c34a4de62d000f29393cf3089',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.1',
    images: [
      {
        digest:
          'sha256:a1038a41fe2b75d8c53d0a4d22207e4e7f72e95a11da4d20424f0062b239b67f',
        architecture: 'amd64',
      },
    ],
  },
  { name: '2.7', images: [] },
  { name: '2.6', images: [] },
]
const versionDataWithTag = [
  {
    name: '3.9.5',
    images: [
      {
        digest:
          'sha256:fa5361fbf636d3ac50cb529dab20d810eb466de2079f5710cef4cbada29cf499',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:97e9e9a15ef94526018e2fabfdfff14781e58b87f989d2e70543f296dcad26c6',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:cae6522b6a351615e547ae9222c9a05d172bc5c3240eec03072d4e1d0429a17a',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:5292cebaf695db860087c5582d340a406613891b2819092747b0388da47936c8',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:0c6b515386fda00a17e4653f007979825f35e0086e583ddc9b91d3eda941bd1b',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:c7b3e8392e08c971e98627e2bddd10c7fa9d2eae797a16bc94de9709bb9300d0',
        architecture: '386',
      },
      {
        digest:
          'sha256:ab3fe83c0696e3f565c9b4a734ec309ae9bd0d74c192de4590fd6dc2ef717815',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.9',
    images: [
      {
        digest:
          'sha256:ab3fe83c0696e3f565c9b4a734ec309ae9bd0d74c192de4590fd6dc2ef717815',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:c7b3e8392e08c971e98627e2bddd10c7fa9d2eae797a16bc94de9709bb9300d0',
        architecture: '386',
      },
      {
        digest:
          'sha256:5292cebaf695db860087c5582d340a406613891b2819092747b0388da47936c8',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:97e9e9a15ef94526018e2fabfdfff14781e58b87f989d2e70543f296dcad26c6',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:0c6b515386fda00a17e4653f007979825f35e0086e583ddc9b91d3eda941bd1b',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:fa5361fbf636d3ac50cb529dab20d810eb466de2079f5710cef4cbada29cf499',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:cae6522b6a351615e547ae9222c9a05d172bc5c3240eec03072d4e1d0429a17a',
        architecture: 'arm64',
      },
    ],
  },
  {
    name: '3.8.5',
    images: [
      {
        digest:
          'sha256:954b378c375d852eb3c63ab88978f640b4348b01c1b3456a024a81536dafbbf4',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:e802987f152d7826cf929ad4999fb3bb956ce7a30966aeb46c749f9120eaf22c',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:cf35b4fa14e23492df67af08ced54a15e68ad00cac545b437b1994340f20648c',
        architecture: '386',
      },
      {
        digest:
          'sha256:402d21757a03a114d273bbe372fa4b9eca567e8b6c332fa7ebf982b902207242',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:dabea2944dcc2b86482b4f0b0fb62da80e0673e900c46c0e03b45919881a5d84',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:514ec80ffbe1a2ab1d9a3d5e6082296296a1d8b6870246edf897228e5df2367d',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '3.8',
    images: [
      {
        digest:
          'sha256:e802987f152d7826cf929ad4999fb3bb956ce7a30966aeb46c749f9120eaf22c',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:954b378c375d852eb3c63ab88978f640b4348b01c1b3456a024a81536dafbbf4',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:cf35b4fa14e23492df67af08ced54a15e68ad00cac545b437b1994340f20648c',
        architecture: '386',
      },
      {
        digest:
          'sha256:514ec80ffbe1a2ab1d9a3d5e6082296296a1d8b6870246edf897228e5df2367d',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:dabea2944dcc2b86482b4f0b0fb62da80e0673e900c46c0e03b45919881a5d84',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:402d21757a03a114d273bbe372fa4b9eca567e8b6c332fa7ebf982b902207242',
        architecture: 'ppc64le',
      },
    ],
  },
  {
    name: '3.10.4',
    images: [
      {
        digest:
          'sha256:747f335d2f685dcdd08813d2302e62a370285c5a8c86bdf152ec993e2f20a7af',
        architecture: '386',
      },
      {
        digest:
          'sha256:4491fd429b8ad188ba5e120782b2bbb704261fd2ef9942fcdee128c5fcc594d5',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:216161924b520a8b99ec0130da5ce39aa1876ed3dd0199df50e16564c7bbf938',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:de78803598bc4c940fc4591d412bffe488205d5d953f94751c6308deeaaa7eb8',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:2632d6288d34d7175021683f6e363fa7c0fa8866a565eb285e36e3b856545e82',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:9afbfccb806687f6979661622f0c04dc534769e742465b107f84a830cbb8e77a',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:33158d51a7a549207e508a42bf46493f23e1e99fbc011eb3f3742e8b349a2be9',
        architecture: 'ppc64le',
      },
    ],
  },
  {
    name: '3.10',
    images: [
      {
        digest:
          'sha256:33158d51a7a549207e508a42bf46493f23e1e99fbc011eb3f3742e8b349a2be9',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:747f335d2f685dcdd08813d2302e62a370285c5a8c86bdf152ec993e2f20a7af',
        architecture: '386',
      },
      {
        digest:
          'sha256:4491fd429b8ad188ba5e120782b2bbb704261fd2ef9942fcdee128c5fcc594d5',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:2632d6288d34d7175021683f6e363fa7c0fa8866a565eb285e36e3b856545e82',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:9afbfccb806687f6979661622f0c04dc534769e742465b107f84a830cbb8e77a',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:216161924b520a8b99ec0130da5ce39aa1876ed3dd0199df50e16564c7bbf938',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:de78803598bc4c940fc4591d412bffe488205d5d953f94751c6308deeaaa7eb8',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: 'edge',
    images: [
      {
        digest:
          'sha256:7b5953e862c998ef1ece3c142df8ae977162e6f30eecef40b4ef393d499f6124',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:e3e522f1325346cf70f03901b26a5a01eb0c73a73d706a16ecfadc0d9583070f',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:cb3bf0adee8921084ef941d9499e92097f4291a2a81d668da1428e62422518db',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:fb7bea212348f9f7b681815f157118fa58677f581f50c1df8ccc32af3e1037b1',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:5f60bf03cace5b582fbe43145f59e8c6295c6965d1b07cdf969f038a2685d4e8',
        architecture: '386',
      },
      {
        digest:
          'sha256:e137ff293fccbe890ba2e4adc6346fd38658ad5be8f867fb84a0ea4d96b46690',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:9898e9a51db3e20a557fe0b2a60494b97200d31f580796e664f126a24ec487cd',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '20200122',
    images: [
      {
        digest:
          'sha256:9898e9a51db3e20a557fe0b2a60494b97200d31f580796e664f126a24ec487cd',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:5f60bf03cace5b582fbe43145f59e8c6295c6965d1b07cdf969f038a2685d4e8',
        architecture: '386',
      },
      {
        digest:
          'sha256:fb7bea212348f9f7b681815f157118fa58677f581f50c1df8ccc32af3e1037b1',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:7b5953e862c998ef1ece3c142df8ae977162e6f30eecef40b4ef393d499f6124',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:cb3bf0adee8921084ef941d9499e92097f4291a2a81d668da1428e62422518db',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:e3e522f1325346cf70f03901b26a5a01eb0c73a73d706a16ecfadc0d9583070f',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:e137ff293fccbe890ba2e4adc6346fd38658ad5be8f867fb84a0ea4d96b46690',
        architecture: 'arm',
      },
    ],
  },
  {
    name: 'latest',
    images: [
      {
        digest:
          'sha256:4d5c5951669588e23881c158629ae6bac4ab44866d5b4d150c3f15d91f26682b',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:401f030aa35e86bafd31c6cc292b01659cbde72d77e8c24737bd63283837f02c',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ef20eb43010abda2d7944e0cd11ef00a961ff7a7f953671226fbf8747895417d',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:c40c013324aa73f430d33724d8030c34b1881e96b23f44ec616f1caf8dbf445f',
        architecture: '386',
      },
      {
        digest:
          'sha256:2c26a655f6e38294e859edac46230210bbed3591d6ff57060b8671cda09756d4',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ff8a6adf5859433869343296f1b06e0a7bdf4fc836b08d5854221e351baf6929',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:ddba4d27a7ffc3f86dd6c2f92041af252a1f23a8e742c90e6e1297bfa1bc0c45',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.11.3',
    images: [
      {
        digest:
          'sha256:401f030aa35e86bafd31c6cc292b01659cbde72d77e8c24737bd63283837f02c',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ddba4d27a7ffc3f86dd6c2f92041af252a1f23a8e742c90e6e1297bfa1bc0c45',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:ef20eb43010abda2d7944e0cd11ef00a961ff7a7f953671226fbf8747895417d',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:2c26a655f6e38294e859edac46230210bbed3591d6ff57060b8671cda09756d4',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:c40c013324aa73f430d33724d8030c34b1881e96b23f44ec616f1caf8dbf445f',
        architecture: '386',
      },
      {
        digest:
          'sha256:4d5c5951669588e23881c158629ae6bac4ab44866d5b4d150c3f15d91f26682b',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:ff8a6adf5859433869343296f1b06e0a7bdf4fc836b08d5854221e351baf6929',
        architecture: 'ppc64le',
      },
    ],
  },
  {
    name: '3.11',
    images: [
      {
        digest:
          'sha256:401f030aa35e86bafd31c6cc292b01659cbde72d77e8c24737bd63283837f02c',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:c40c013324aa73f430d33724d8030c34b1881e96b23f44ec616f1caf8dbf445f',
        architecture: '386',
      },
      {
        digest:
          'sha256:2c26a655f6e38294e859edac46230210bbed3591d6ff57060b8671cda09756d4',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ff8a6adf5859433869343296f1b06e0a7bdf4fc836b08d5854221e351baf6929',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:ddba4d27a7ffc3f86dd6c2f92041af252a1f23a8e742c90e6e1297bfa1bc0c45',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:4d5c5951669588e23881c158629ae6bac4ab44866d5b4d150c3f15d91f26682b',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:ef20eb43010abda2d7944e0cd11ef00a961ff7a7f953671226fbf8747895417d',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '3',
    images: [
      {
        digest:
          'sha256:401f030aa35e86bafd31c6cc292b01659cbde72d77e8c24737bd63283837f02c',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:2c26a655f6e38294e859edac46230210bbed3591d6ff57060b8671cda09756d4',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:c40c013324aa73f430d33724d8030c34b1881e96b23f44ec616f1caf8dbf445f',
        architecture: '386',
      },
      {
        digest:
          'sha256:ef20eb43010abda2d7944e0cd11ef00a961ff7a7f953671226fbf8747895417d',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:ddba4d27a7ffc3f86dd6c2f92041af252a1f23a8e742c90e6e1297bfa1bc0c45',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:ff8a6adf5859433869343296f1b06e0a7bdf4fc836b08d5854221e351baf6929',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:4d5c5951669588e23881c158629ae6bac4ab44866d5b4d150c3f15d91f26682b',
        architecture: 'arm64',
      },
    ],
  },
  {
    name: '3.11.2',
    images: [
      {
        digest:
          'sha256:ba07bedf11ebc316ec7c12a7adb791971535cc3e21c69576db706b5b736b813e',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:892105a25acfbcb693eba42428b5a7daa63e20a1b1c85bd225ef36f447db9182',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:4782ed3b32fa6d0dc526f7772172a86445168320c2aebde5a7017c2e229bbf10',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:50cd675002032820d09a38c4d4df25d19a8814b4b38855090a27434a33609066',
        architecture: '386',
      },
      {
        digest:
          'sha256:e1138bb27b6d4fd0b871bef09503dd9a143ecc96dce2126bf88c520e0ea998bb',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:3983cc12fb9dc20a009340149e382a18de6a8261b0ac0e8f5fcdf11f8dd5937e',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:bf9ea7e74684d7ffbf167130740177e680ae4770e3e00da710eb567edb15b26c',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '3.11.0',
    images: [
      {
        digest:
          'sha256:d965afc5cd134c484d26a74aca4592b843cc7f3349af63498535f5486f28bb60',
        architecture: '386',
      },
      {
        digest:
          'sha256:f360950221f8f53d6242c61ae0e22cd779d5d1f5caceb599a3502fa03ac26e31',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:aec3cf8ea78f690acc18450304f23e9dae4cc33d346597eb036e33a66d8da085',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:9026e194fffefc65996f84fdfd9d0fc48d17f455c0191d4652a73fa0555c4142',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:d371657a4f661a854ff050898003f4cb6c7f36d968a943c1d5cde0952bd93c80',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:f61a0c3c620b07b22610d464040e773ea57773025330b5c8c448bc83d7222820',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:663e0e4b1049b52d60fe01799a2aedc875bd18f555c88e4b7ba2377927c1db36',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '20191219',
    images: [
      {
        digest:
          'sha256:147b00fcf6fc7b701b6ea9aae2b2436483b68b97a59b2bf64383084dd6d2d58f',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:1a4839802b9242aa55b309ad469e0dd77d0a88a48e432f950d1319f944ce5e8b',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:abe500b56242b1b762f9de2fe066d2520640541a04c821f56ac240605e447f88',
        architecture: '386',
      },
      {
        digest:
          'sha256:e0851153cb8e20ad43e0bab92fb6c8a1bdb4afabc1ea8329863b55a663ccecc3',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:b837b9420bb4f67956da5bb9103cfb43917004a9e2715e5197c9b9a74d222233',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:423f0b0c44a8e4da4c7f64b7ffba0d6391e847a82d0b759bcaae5a1f81bf3d42',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:5b94d101a874c5355bd02b05a1a81d26ae63e43234926bf6d951ef02d8f110f9',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '20191114',
    images: [
      {
        digest:
          'sha256:4cacc7777b719f9257c3a6bdf750c8eda7a3932d94d6f8f44b72979b50046268',
        architecture: '386',
      },
      {
        digest:
          'sha256:5c3e629993b44387888c98f1c80f81381226e36938e790a8a38ed2b08a5f51ac',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:6f5b5d6bee15fa8b0e8690890c2ed9784edb2a23a3bddf3e9b767d7afb38b03a',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:2817069dcebecf0363073d8cba05a398aef599de22d114cfd3e6a314a17e7756',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:63f10f6f38e4471b044d318ac0b0768fbc7c46e6bbfd0787b58de8ba43496b50',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:81a04d8e480e002eab2116c33d88c09ea9902c5857c02ba96fbc15c5cde4d6a6',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:6b4a5423c7c0b11a76ca14f86c4c3723239ec717a56c19a56d6f26474f9cc690',
        architecture: 'ppc64le',
      },
    ],
  },
  {
    name: '3.10.3',
    images: [
      {
        digest:
          'sha256:29a82d50bdb8dd7814009852c1773fb9bb300d2f655bd1cd9e764e7bb1412be3',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:1827be57ca85c28287d18349bbfdb3870419692656cb67c4cd0f5042f0f63aec',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:77cbe97593c890eb1c4cadcbca37809ebff2b5f46a036666866c99f08a708967',
        architecture: '386',
      },
      {
        digest:
          'sha256:915a0447d045e3b55f84e8456de861571200ee39f38a0ce70a45f91c29491a21',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:e4355b66995c96b4b468159fc5c7e3540fcef961189ca13fee877798649f531a',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:6dff84dbd39db7cb0fc928291e220b3cff846e59334fd66f27ace0bcfd471b75',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:d8d321ec5eec88dee69aec467a51fe764daebdb92ecff0d1debd09840cbd86c6',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '20190925',
    images: [
      {
        digest:
          'sha256:d047b0686c3c2612c142d67410b2e0f440de5c03dd3dbf96f40987ad65d3125e',
        architecture: '386',
      },
      {
        digest:
          'sha256:fce1d670e6d1dfd6a893ba8e1fd4647d13e8c13f8832901dfc58e07e0662dd3a',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:6ebfb9f5d26acee346776ac8569e515cb447fba5f12fe89b76a6e6e6d1f18a8c',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:fcba4b2bd9b151cc94c0407982f7df094f99bb5c3bc27008b6248f822039ee80',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:b59cc32d2e7ebedf81d0614dd87a87c6f9f8d74b8418722a9a52adbe9eeb2b7a',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:d0cd29c3b39680f9673f1f0cff4dfbeb65202d47577d9fe38491e76895adcbb4',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:6b53bb87c752dfb006c8a4746f5dafcf1d121d53d569dd450dffceacfce66a33',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.10.2',
    images: [
      {
        digest:
          'sha256:499416c8a5bcb311d75e12fb4667886e32b43aaf11003be2a334cbe265e81ce4',
        architecture: '386',
      },
      {
        digest:
          'sha256:5abbfe2915ad8c466bf6c9f33d03622cde0298c36cd88f55d16a3aa3d9c2c35e',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:43955d6857268cc948ae9b370b221091057de83c4962da0826f9a2bdc9bd6b44',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:db7f3dcef3d586f7dd123f107c93d7911515a5991c4b9e51fa2a43e46335a43e',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:acd3ca9941a85e8ed16515bfc5328e4e2f8c128caa72959a58a127b7801ee01f',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:1316a4e4b2361242457f4136cc409c38e8a48ffda76e4e1be31896006e5fc4a2',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:0489474da8ea22426ece86ace6c1c0026ab2fd3cdfbbd62b7e94650266c37d9a',
        architecture: 'arm',
      },
    ],
  },
  {
    name: '3.8.4',
    images: [
      {
        digest:
          'sha256:360e20fc240529450cf378756935230541da805701e3ff895305b72f37ce4d9c',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:899a03e9816e5283edba63d71ea528cd83576b28a7586cf617ce78af5526f209',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:26a8d1303ea6109122ba2df7fafcfbe77ddc3988a2c34e818398b8ed4a20b03d',
        architecture: '386',
      },
      {
        digest:
          'sha256:4446f81140f30b7041ac1984e8cb1fcab2b50357ccf67780147505ef4a136c89',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:30430986cdd82266d148bc4911859c3160c9577b993633908a572339978a52a9',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:f29c3d10359dd0e6d0c11e4f715735b678c0ab03a7ac4565b4b6c08980f6213b',
        architecture: 'arm',
      },
    ],
  },
  {
    name: '20190809',
    images: [
      {
        digest:
          'sha256:4edcccc2f87d4c79945a1579387abf0392b1639b606cdfb90fb4718223f9bb5f',
        architecture: '386',
      },
      {
        digest:
          'sha256:783ffbd8e3701ffe28ddffaf9c3a26249cee5108b471229cc32bcb99e892e08f',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:5bb71492bc8c0b935c8d609eb1d47ceda27bf899af02d2d72eb4142f35a03675',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:f01913bcc3593cad3786f632239100ff7616ff5a4ba88bf3065018d7b64f9b80',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:f22000e09b6a017c77e6c95418b5a331c79399055a15c3712fd41dfa889b2d67',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:9928890987d7ed2551cf1e426339c30eb0cbac9922858ed6adf1b98eff83b998',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:dae909606f734c78971984316fbd8a68541feb33bf703a01621d7d8ffd47e7a9',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.10.1',
    images: [
      {
        digest:
          'sha256:d69be64353c91f02fbccbad56e545122636a02d2ee1c9ffa99a6219a8d4d9f73',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:b206388a8e17c4a9c8e1c0d8f28dde06632dee48ac8409a6e5460280f978f593',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:c540a864de9947de37986965a796751279904c3b8c0f4e487fa9cf52f6372079',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:afd6ffe2b877c475f697a2c19b9f23f97d21e176c652e91f028d9400e21f8617',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:fa56b4f2cbe6498fb15be09b0e026b61d1883bf0550f0770c6193a40da12425b',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ef77e1079a17df210045ffa5dc19214ccdb89e001f32ffab2e61a1c743c2aec7',
        architecture: '386',
      },
      {
        digest:
          'sha256:57334c50959f26ce1ee025d08f136c2292c128f84e7b229d1b0da5dac89e9866',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '20190707',
    images: [
      {
        digest:
          'sha256:1b04d9c73a8c52ce1df93b351f3517eaf24730bf751f1d547fd04bd1e41720f6',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:272f00157687c245c28e546f5d106a2496d92883c35275113684e24a24aeef6d',
        architecture: '386',
      },
      {
        digest:
          'sha256:a9e1483e9ea23ba640ad9cd2949fc7c9dcc00e2b789d538505207c7d8f1637f3',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:8263fe7c497089bc195d119be3a617f99f9f0121af759bfb5ec32bd914c55bcd',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:d108a8892b77b9e3d1ca0e3bcfb9c1f86fa4ba0a7a56f5af9e1571ed27458f3c',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:c04b643dedaccae53e036f2bf72b0e792870f51708aff6ceaa6895de60e46257',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:f88c7a97db3630d64d75916ee7ee694f7f95a9c9a0bd997abf1c9a5812f83894',
        architecture: 'arm64',
      },
    ],
  },
  {
    name: '3.9.4',
    images: [
      {
        digest:
          'sha256:bf1684a6e3676389ec861c602e97f27b03f14178e5bc3f70dce198f9f160cce9',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:d438d3b6a72b602b70bd259ebfb344e388d8809c5abf691f6de397de8c9e4572',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:1be52adf0390937540f21f66fb8dc4c155b3a0325e380001be08fd5923359e81',
        architecture: '386',
      },
      {
        digest:
          'sha256:1032bdba4c5f88facf7eceb259c18deb28a51785eb35e469285a03eba78dd3fc',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:cb238aa5b34dfd5e57ddfb1bfbb564f01df218e6f6453e4036b302e32bca8bb5',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:f6d15ec5c7cf08079309c59f59ff1e092eb9a678ab891257b1d2b118e7aecc2b',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:fc6ad107f85e5210d7cbbdb00b6af0b8b1c94a2b0cecc77db19e853b87cd549e',
        architecture: 'arm',
      },
    ],
  },
  {
    name: '3.7.3',
    images: [
      {
        digest:
          'sha256:c51b8029218660b67e5513ae1945f9fcd11cb8f4fa536e8a66f1566f68c81ade',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ab1f6f59e27b660c2d5a8416cd9ebbb15532a368e828537218819ee77ee54658',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:07d69855442f842117e85f24b58ba7cdd54166281d48fa05c58b6b79599d2181',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:bd9fbba517359ec529587753ea1153072c08ada74a8c3fbcbd81dd6421047cb3',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:90048fac253b6c28722c6fd725af0b3232c20ac6369d6d7bc4f9f96dced14de3',
        architecture: '386',
      },
      {
        digest:
          'sha256:92251458088c638061cda8fd8b403b76d661a4dc6b7ee71b6affcf1872557b2b',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.7',
    images: [
      {
        digest:
          'sha256:c51b8029218660b67e5513ae1945f9fcd11cb8f4fa536e8a66f1566f68c81ade',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:92251458088c638061cda8fd8b403b76d661a4dc6b7ee71b6affcf1872557b2b',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:ab1f6f59e27b660c2d5a8416cd9ebbb15532a368e828537218819ee77ee54658',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:bd9fbba517359ec529587753ea1153072c08ada74a8c3fbcbd81dd6421047cb3',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:07d69855442f842117e85f24b58ba7cdd54166281d48fa05c58b6b79599d2181',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:90048fac253b6c28722c6fd725af0b3232c20ac6369d6d7bc4f9f96dced14de3',
        architecture: '386',
      },
    ],
  },
  {
    name: '3.10.0',
    images: [
      {
        digest:
          'sha256:67c5653165b7435056dc66116cf397de88ab9a78d91da4f58ded69d268c5a0ac',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:6e8a04da457c3a62a2e3d4ecff45c990dd741e1192e97aa86fc734d2c348ed20',
        architecture: '386',
      },
      {
        digest:
          'sha256:6aafb1cd153b876ded81f273524ec54a9b4869fc5aecb739f2a625fe40d51caf',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:cb461feb0da34722454f1f5838ca678bb54b2b16216395aa9b80d7a32ff21816',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:617547cc8356dc45d8c1ca58a30052dc74c666656700529b548bac50209db05e',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:c4f32ede4ca905e0410490655b8993abb9fb77742e90a570ac28a8ca334f6c2b',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:97a042bf09f1bf78c8cf3dcebef94614f2b95fa2f988a5c07314031bc2570c7a',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '20190508',
    images: [
      {
        digest:
          'sha256:dcf512634857fc8252c6dbcaf12d4315dae50e9c54f6d08cdcc6b6be70cf3a81',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:412f64cbca6be70040e109a005aaeed7ee9c41d55e66fcf5efe8a1dfc7170fa8',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:bdd3302b00c4b9adfdc626a09061eba874ace728d6d263bb3cdfb1e0d6bc0f2a',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:65eab606c870e7bd656b220860e80ac48aeaa7be8c728a7d68d19bc1addb504a',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:2a8c37424195a515b6f7567d65896194940450c97c2137a327298cb9d930c4cb',
        architecture: '386',
      },
      {
        digest:
          'sha256:1538fe976d2cf7e6f4befe36439ad68fc825c916170db3143b05dc4df6a9962d',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:40910392cf5e22cca21935364e26569ede5f17c3d245434e53aade208f1c7023',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.6.5',
    images: [
      {
        digest:
          'sha256:43773d1dba76c4d537b494a8454558a41729b92aa2ad0feb23521c3e58cd0440',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:5d3e0daa0d346611b74cdce60d9ca335cba6bff97ed7d2eeddf83f4a839dc340',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:25e814211fdda16b4e27e1483a5dfa17d7e958b8c539ee1ee942962c5d33d6de',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:4b69660fc940a85e9c0e5c1caec59f514b0966bec394267b450282b2408f6874',
        architecture: '386',
      },
      {
        digest:
          'sha256:548ca2eca3c2ce9282c7782c9367d1c2051e28511e25f78e977a2859c3946fa7',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:8d7e7a7a8066a153edbddb0fb15f29e32dda209b5d69d5caafc52314cb30f15e',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '3.6',
    images: [
      {
        digest:
          'sha256:43773d1dba76c4d537b494a8454558a41729b92aa2ad0feb23521c3e58cd0440',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:5d3e0daa0d346611b74cdce60d9ca335cba6bff97ed7d2eeddf83f4a839dc340',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:25e814211fdda16b4e27e1483a5dfa17d7e958b8c539ee1ee942962c5d33d6de',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:4b69660fc940a85e9c0e5c1caec59f514b0966bec394267b450282b2408f6874',
        architecture: '386',
      },
      {
        digest:
          'sha256:548ca2eca3c2ce9282c7782c9367d1c2051e28511e25f78e977a2859c3946fa7',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:8d7e7a7a8066a153edbddb0fb15f29e32dda209b5d69d5caafc52314cb30f15e',
        architecture: 's390x',
      },
    ],
  },
  {
    name: '3.9.3',
    images: [
      {
        digest:
          'sha256:b2cb61b9bc0f4be88ca9f50173023bed88daf583df11700c442812e3e346b08e',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:91ba0d6f4f61796f41ed07b5aaea6ba35b9e8da6f82ce0942ff41f04e200940a',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:cdf98d1859c1beb33ec70507249d34bacf888d59c24df3204057f9a6c758dddb',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:660030ffd296125c8af2f25a34ab2c12ac3d7656b31ac40ccf52eb14cd1c4bf0',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:98a10a4a0eb8ab9076ec7f413e34976716b989b71b2ac57e7082b3c28b884342',
        architecture: '386',
      },
      {
        digest:
          'sha256:49618257b6954e534630e7911df5030321d1a592c4070396c8150c6113684502',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:b2cb61b9bc0f4be88ca9f50173023bed88daf583df11700c442812e3e346b08e',
        architecture: 'arm',
      },
    ],
  },
  {
    name: '20190408',
    images: [
      {
        digest:
          'sha256:9115a39c7c7b43b8d8aa70d5f849b736a467137f1b69fde4bd9400fc60f3b8cc',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:b14c6d20e7a8f098867f4d3d8aea946b859be02585689be4e0879fd9457bc96e',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:3f38c53866fa6bf21451706cc9b58f108ab276ef16469b3ebb083f73d1a0c0dc',
        architecture: '386',
      },
      {
        digest:
          'sha256:fc7888a3be9a41141a887e7b82dbbe69645a2a3a70249de5a8178b01f84ad3ef',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:3cb185f08bc54c9d147ea8cf800e6ff6b2a1be466e5bad81ab5d7fb8fff94cc6',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:b34a0f0ed3f8206f21852d1dd77b8d715e1bc3c0ba93b72d6b0a0beb109ffd56',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:3e8d7a5561f04987c8cf4e25f8138f60889ba1a0e5ec2b2e7469be88e237695b',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.9.2',
    images: [
      {
        digest:
          'sha256:92dce741fcda25c45fb32400ccf765ec1947d8f77e3570626470da69b608afc0',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:ef872b76f64d00bc19628b0194994d67480b5b2a2813be50fb223e79eb56dc77',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:4ece8077c7148089358a76cb9ec43c1fd92982ae4fb493980d26eec6b7605a68',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:c6029ce25b4555a61c0a0e6ddac11a9055a01d42b009567cb6615502a93c5dcf',
        architecture: '386',
      },
      {
        digest:
          'sha256:f663714dca1af21af37546a875f0146db50643d8ac894c09f4f01639cefcca6b',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:05cd2c94024fda6b368e76a5114411b893f45e14a3b0072ec5cc563104522d4c',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:5cb3aa00f89934411ffba5c063a9bc98ace875d8f92e77d0029543d9f2ef4ad0',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '20190228',
    images: [
      {
        digest:
          'sha256:778603491523f537ca4b4f8fb48884701ed055e117ae3e1a87853b7be25d5b8e',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:5e65916a4c8418b1d1eb9d50d41b962bf77a0d492d8129b83b2529b778439c62',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:6ef64e18e265364f2c635f3ba449a2aa0bc0f694e4d637382918ce8dbcad5f8c',
        architecture: 'arm64',
      },
      {
        digest:
          'sha256:7da711226313112a7e9e29efecac905250258c913d4eeb78321e79266aca243e',
        architecture: 'amd64',
      },
      {
        digest:
          'sha256:04b05b48182f1b1631abf7d96b54c124f1cee68aa2f26f184e93c3261b627fc8',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:11ca6afcbae6d138762fd7337d5c47764737c2cedc0d3718ae33c864f6556f32',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:a9f83df58a9a5481892157035a39ee1f7d281a4d28ba83a642b2452e2a93447f',
        architecture: '386',
      },
    ],
  },
  {
    name: '3.5',
    images: [
      {
        digest:
          'sha256:f80194ae2e0ccf0f098baa6b981396dfbffb16e6476164af72158577a7de2dd9',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.4',
    images: [
      {
        digest:
          'sha256:b7c5ffe56db790f91296bcebc5158280933712ee2fc8e6dc7d6c96dbb1632431',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.3',
    images: [
      {
        digest:
          'sha256:a6fc1dbfa81a7fc3119a3a28ce05d1d3f31898169603af669c75640880150de7',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.2',
    images: [
      {
        digest:
          'sha256:98f5f2d17bd1c8ba230ea9a8abc21b8d7fc8727c34a4de62d000f29393cf3089',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.1',
    images: [
      {
        digest:
          'sha256:a1038a41fe2b75d8c53d0a4d22207e4e7f72e95a11da4d20424f0062b239b67f',
        architecture: 'amd64',
      },
    ],
  },
  { name: '2.7', images: [] },
  { name: '2.6', images: [] },
]

const versionDataWithVaryingArchitectures = [
  {
    name: '3.9.5',
    images: [
      {
        digest:
          'sha256:fa5361fbf636d3ac50cb529dab20d810eb466de2079f5710cef4cbada29cf499',
        architecture: 'ppc64le',
      },
      {
        digest:
          'sha256:97e9e9a15ef94526018e2fabfdfff14781e58b87f989d2e70543f296dcad26c6',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:cae6522b6a351615e547ae9222c9a05d172bc5c3240eec03072d4e1d0429a17a',
        architecture: 'arm64',
      },
    ],
  },
  {
    name: '3.9',
    images: [
      {
        digest:
          'sha256:c7b3e8392e08c971e98627e2bddd10c7fa9d2eae797a16bc94de9709bb9300d0',
        architecture: '386',
      },
      {
        digest:
          'sha256:5292cebaf695db860087c5582d340a406613891b2819092747b0388da47936c8',
        architecture: 'arm',
      },
    ],
  },
  {
    name: '3.8.5',
    images: [
      {
        digest:
          'sha256:dabea2944dcc2b86482b4f0b0fb62da80e0673e900c46c0e03b45919881a5d84',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:514ec80ffbe1a2ab1d9a3d5e6082296296a1d8b6870246edf897228e5df2367d',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:ab3fe83c0696e3f565c9b4a734ec309ae9bd0d74c192de4590fd6dc2ef717815',
        architecture: 'amd64',
      },
    ],
  },
  {
    name: '3.8',
    images: [
      {
        digest:
          'sha256:cf35b4fa14e23492df67af08ced54a15e68ad00cac545b437b1994340f20648c',
        architecture: '386',
      },
      {
        digest:
          'sha256:514ec80ffbe1a2ab1d9a3d5e6082296296a1d8b6870246edf897228e5df2367d',
        architecture: 's390x',
      },
      {
        digest:
          'sha256:402d21757a03a114d273bbe372fa4b9eca567e8b6c332fa7ebf982b902207242',
        architecture: 'ppc64le',
      },
    ],
  },
  {
    name: '3.10.4',
    images: [
      {
        digest:
          'sha256:2632d6288d34d7175021683f6e363fa7c0fa8866a565eb285e36e3b856545e82',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:9afbfccb806687f6979661622f0c04dc534769e742465b107f84a830cbb8e77a',
        architecture: 'arm',
      },
      {
        digest:
          'sha256:33158d51a7a549207e508a42bf46493f23e1e99fbc011eb3f3742e8b349a2be9',
        architecture: 'ppc64le',
      },
    ],
  },
  { name: '2.7', images: [] },
  { name: '2.6', images: [] },
]

export {
  sizeDataNoTagSemVerSort,
  versionDataNoTagDateSort,
  versionPagedDataNoTagDateSort,
  versionDataNoTagSemVerSort,
  versionDataWithTag,
  versionDataWithVaryingArchitectures,
}
