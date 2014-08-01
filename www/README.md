#Tabbed Template for building an app in Famo.us
###Serve from file
```
open index.html
```
###View Hierarchy
```
TabTemplate
└──HeaderFooterLayout
    ├──HeaderView
    │  └──BackButtonView
    ├──ContentView
    │  ├──FamousView
    │  ├──ScrollDemo
    │  │  └──x───ScrollListItem
    │  └──DetailView
    └──FooterView
       └──3x──TabButtonView
```
###Directory Tree
```
.
├── css/
│   └── app.css
├── resources/
│   └── famous_logo.png
├── src/
│   ├── controllers/
│   │   └── History.js
│   ├── templates/
│   │   ├── about.js
│   │   └── detail.js
│   ├── views/
│   │   ├── BackButtonView.js
│   │   ├── ContentView.js
│   │   ├── DetailView.js
│   │   ├── FamousView.js
│   │   ├── FooterView.js
│   │   ├── HeaderView.js
│   │   ├── ScrollDemo.js
│   │   ├── ScrollListItem.js
│   │   ├── TabButtonView.js
│   │   └── TabTemplate.js
│   └── main.js
├── README.md
└── index.html
```
