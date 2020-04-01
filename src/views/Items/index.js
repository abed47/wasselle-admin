import React, {Component} from 'react';
import {fb} from './../../firebase';
import uniqid from 'uniqid';
import {AppSwitch} from '@coreui/react'
import Joi from '@hapi/joi';
import {
    Container,
    Row,
    Col,
    Table,
    Modal,
    ModalFooter,
    ModalBody,
    ModalHeader,
    Button,
    ButtonGroup,
    InputGroup,
    InputGroupAddon,
    Input,
    InputGroupText,
    Alert,
    Pagination,
    PaginationItem,
    PaginationLink,
    Card,
    CardBody,
    CardHeader
} from 'reactstrap';
const fs = fb.firestore();
let validSchema = Joi.object({
    imageDownloadUrl: Joi.string().required(),
    modalItemTitle: Joi.string().min(4).max(20).required(),
    modalItemPrice: Joi.number().required(),
    modalItemUnitMeasure: Joi.string().required(),
    modalItemDescription: Joi.required(),
    modalItemImgAlt: Joi.string().min(4).required(),
    modalItemCategoryId: Joi.string().required(),
    modalItemMostOrdered: Joi.required(),
    modalItemMostViewed: Joi.required(),
    modalItemIsNew: Joi.required(),
    modalItemQuantity: Joi.required()
})
class Items extends Component{

    constructor(props){
        super(props)
        this.state = {
            categories : [],
            listItems: [],
            currentPageItems: [],
            currentPageIndex: 1,
            pageCount: 0,
            itemAddShow: false,
            modalItemTitle: '',
            modalItemPrice: '',
            modalItemUnitMeasure: '',
            modalItemCategoryId : '',
            modalItemImgAlt: '',
            modalItemDescription: '',
            modalItemQuantity: '',
            modalItemMostViewed: false,
            modalItemMostOrdered: false,
            modalItemIsNew: false,
            previewSrc:'',
            imageUpladeStatus: '',
            imageDownloadUrl: '',
            uploadImageProgress: false,
            itemLoadingButton: false,
            messageText: '',
            messageMode: '',
            messageVisible: false,
            deleteModalShow: false,
            editModalShow: false,
            selectedItemId: '',
            selectedItemIndex: 0
        }
    }

    componentDidMount(){
        this.getData()
    }

    async getData(){
        let catPlaceHolder = []
        let productsHolder = [];
        let catRef = await fs.collection('categories');
        let itemsRef = await fs.collection('items')
        catRef
        .get()
        .then(
            docs => {
            docs.forEach(
                doc => {
                let obj = doc.data();
                obj.id = doc.id;
                catPlaceHolder.push(obj)
            })
        })
        .then(() => {
            this.setState({
                categories: catPlaceHolder,
                modalItemCategoryId: !catPlaceHolder.length ? '' : catPlaceHolder[0].id
            })
        })

        itemsRef.get()
        .then(
            docs => {
                docs.forEach(
                    doc => {
                        let obj = doc.data();
                        obj.id = doc.id;
                        productsHolder.push(obj)
                })
        }).then(() => {
            this.setState({
                listItems: productsHolder,
                pageCount: Math.ceil(productsHolder.length / 10),
            },() => {
                this.changeCurrentPageItems(this.state.listItems,this.state.currentPageIndex)
            })
        })
    }

    PaginationItems(count){
        let pageinationLinks = []
        for(let i = 0; i < count; ++i){
            pageinationLinks.push(
                <PaginationItem key={i} active={i + 1 === this.state.currentPageIndex ? true : false} >
                    <PaginationLink tag="button" onClick={() => this.setCurrentPageIndex(i + 1)} >{i + 1}</PaginationLink>
                </PaginationItem>
            )
        }
        return pageinationLinks
    }

    setCurrentPageIndex(i){
        this.setState({
            currentPageIndex: i
        },() => {
            this.changeCurrentPageItems(this.state.listItems,i)
        })
    }

    changeCurrentPageItems(items,pIndex){
        let startIndex = pIndex === 1 ? 0 : pIndex * 10 - 10;
        let endIndex = startIndex === 0 ? 10 : startIndex + 10
        let pItems = items.slice(startIndex, endIndex)
        this.setState({
            currentPageItems : pItems
        })
    }

    async handleLoadAvatar(e) {
        var file = e.target.files[0];
        var reader = new FileReader();
        let storageRef = await fb.storage().ref()
        let imageId = uniqid(new Date().getTime());
        reader.onload = (e) => {
          var img = document.createElement("img");
          img.onload = () => {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
      
            var MAX_WIDTH = 150;
            var MAX_HEIGHT = 150;
            var width = img.width;
            var height = img.height;
      
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);
            var dataurl = canvas.toDataURL("image/png");
            this.setState({previewSrc: dataurl});
            this.toggleImageUploadSpinner()
            storageRef
            .child(`items/${imageId}.png`)
            .putString(dataurl,'data_url')
            .then(snapshot => {
                if(snapshot.state === 'success'){
                    this.toggleImageUploadSpinner()
                    snapshot.ref.getDownloadURL().then( url => {
                        this.setState({
                            imageDownloadUrl: url,
                            imageUpladed: true,
                            imageUpladeStatus: 'success'
                        })
                    })
                }else{
                    this.setState({
                        imageUpladeStatus: snapshot.state,
                        uploadImageProgress: !this.state.uploadImageProgress
                    })
                }
            })
          }
          img.src = e.target.result;
        }
        reader.readAsDataURL(file);
      }

    async addItem(item){
        let fs = fb.firestore()
        let ref = await fs.collection('items');
        let updatedItem = {
            categoryId: item.modalItemCategoryId,
            description: item.modalItemDescription,
            imgAlt: item.modalItemImgAlt,
            imgPath: item.imageDownloadUrl,
            isMostO: item.modalItemMostOrdered,
            isMostV: item.modalItemMostViewed,
            isNew: item.modalItemIsNew,
            name: item.modalItemTitle,
            quantity: item.modalItemQuantity,
            unitMeasure: item.modalItemUnitMeasure,
            unitPrice: item.modalItemPrice
        }
        ref.add(updatedItem).then(v => {
            updatedItem.id = v.id
            this.handleItemAdded(updatedItem)
        }).catch(err => {
            console.log(err)
        })
    }


    validate(){
        let items = {
            imageDownloadUrl: this.state.imageDownloadUrl,
            modalItemTitle: this.state.modalItemTitle,
            modalItemPrice: this.state.modalItemPrice,
            modalItemUnitMeasure: this.state.modalItemUnitMeasure,
            modalItemDescription: this.state.modalItemDescription,
            modalItemImgAlt: this.state.modalItemImgAlt,
            modalItemCategoryId: this.state.modalItemCategoryId,
            modalItemMostViewed: this.state.modalItemMostViewed,
            modalItemMostOrdered: this.state.modalItemMostOrdered,
            modalItemIsNew: this.state.modalItemIsNew,
            modalItemQuantity: this.state.modalItemQuantity
        }
        const values = validSchema.validate(items)

        if(!values.error){
            if(!this.state.itemLoadingButton){
                this.toggleLoadingModal()
                this.addItem(items)
            }

            return;
        }

        this.showMessage(values.error.message,'danger')

    }

    handleItemAdded(item){
        let updatedItems = this.state.listItems;
        updatedItems.unshift(item)
        this.setState({
            itemAddShow: false,
            modalItemTitle: '',
            modalItemPrice: '',
            modalItemUnitMeasure: '',
            modalItemImgAlt: '',
            modalItemDescription: '',
            modalItemQuantity: '',
            modalItemMostViewed: false,
            modalItemMostOrdered: false,
            modalItemIsNew: false,
            previewSrc:'',
            imageUpladeStatus: '',
            imageDownloadUrl: '',
            uploadImageProgress: false,
            itemLoadingButton: false,
            listItems: updatedItems,
            pageCount: Math.ceil(updatedItems.length / 10)
        },() => {
            this.changeCurrentPageItems(this.state.listItems,this.state.currentPageIndex)
        })

        this.showMessage('successfully added item!','success')
    }

    showMessage(message, mode){
        this.setState({
            messageText: message,
            messageMode: mode
        },() => {
            this.setState({
                messageVisible: true
            })
        })
    }

    handleCategoryChange(id){
        this.setState({
            modalItemCategoryId: id
        })
    }

    toggleLoadingModal(){
        this.setState({
            showLoadingModal: !this.state.showLoadingModal
        })
    }

    toggleModalItemIsNew(){
        this.setState({
            modalItemIsNew : !this.state.modalItemIsNew
        })
    }

    toggleModalItemMostViewed(){
        this.setState({
            modalItemMostViewed: !this.state.modalItemMostViewed
        })
    }

    toggleModalItemMostOrdered(){
        this.setState({
            modalItemMostOrdered: !this.state.modalItemMostOrdered
        })
    }

    toggleAddItemModal(){
        this.setState({
            itemAddShow: !this.state.itemAddShow
        })
    }

    toggleImageUploadSpinner(){
        this.setState({
            uploadImageProgress: !this.state.uploadImageProgress
        })
    }

    toggleDeleteModal(){
        this.setState({
            selectedItemId: '',
            selectedItemIndex: 0,
            deleteModalShow: false,
            itemLoadingButton:false
        })
    }

    toggleEditModal(){
        this.setState({
            modalItemTitle: '',
            modalItemPrice: '',
            modalItemUnitMeasure: '',
            modalItemImgAlt: '',
            modalItemDescription: '',
            modalItemQuantity: '',
            modalItemMostViewed: false,
            modalItemMostOrdered: false,
            modalItemIsNew: false,
            previewSrc: '',
            uploadImageProgress: false,
            itemLoadingButton: false,
            selectedItemId: '',
            selectedItemIndex: 0,
            editModalShow: false
        })
    }

    handleItemDelete(id,index){
        this.setState({
            selectedItemId: id,
            selectedItemIndex: index,
            deleteModalShow: true
        })
    }

    handleItemEdit(item,index){
        this.setState({
            modalItemTitle: item.name,
            modalItemPrice: item.unitPrice,
            modalItemUnitMeasure: item.unitMeasure,
            modalItemImgAlt: item.imgAlt,
            modalItemDescription: item.description,
            modalItemQuantity: item.quantity,
            modalItemMostViewed: item.isMostV,
            modalItemMostOrdered: item.isMostO,
            modalItemIsNew: item.isNew,
            previewSrc: item.imgPath,
            uploadImageProgress: false,
            itemLoadingButton: false,
            selectedItemId: item.id,
            selectedItemIndex: index,
            editModalShow: true,
            modalItemCategoryId : item.categoryId,
        })
    }

    deleteItem(){
        let id = this.state.selectedItemId;
        let index = this.state.selectedItemIndex;
        let oldIndex = index;
        this.setState({itemLoadingButton:true})
        fb
        .firestore()
        .collection('items')
        .doc(id)
        .delete()
        .then(() => {
            let updatedItems = this.state.listItems;
            this.toggleDeleteModal()
            this.setState({
                listItems: updatedItems,
                pageCount: Math.ceil(updatedItems.length / 10)
            },() => {
                updatedItems.splice(oldIndex,1);
                this.changeCurrentPageItems(this.state.listItems,this.state.currentPageIndex)
                this.showMessage('item deleted!','success')
            })
        })

    }

    editItem(){
        let oldIndex = this.state.selectedItemIndex;
        let updatedItem = this.state.listItems[oldIndex];
        let updatedItems = this.state.listItems;
        this.setState({itemLoadingButton: true})
        fb.firestore()
        .collection('items')
        .doc(this.state.selectedItemId)
        .set({
            categoryId: this.state.modalItemCategoryId,
            description: this.state.modalItemDescription,
            imgAlt: this.state.modalItemImgAlt,
            imgPath: this.state.imageDownloadUrl,
            isMostO: this.state.modalItemMostOrdered,
            isMostV: this.state.modalItemMostViewed,
            isNew: this.state.modalItemIsNew,
            name: this.state.modalItemTitle,
            quantity: this.state.modalItemQuantity,
            unitMeasure: this.state.modalItemUnitMeasure,
            unitPrice: this.state.modalItemPrice
        }).then(() => {
            updatedItem = {
                categoryId: this.state.modalItemCategoryId,
                description: this.state.modalItemDescription,
                imgAlt: this.state.modalItemImgAlt,
                imgPath: this.state.imageDownloadUrl,
                isMostO: this.state.modalItemMostOrdered,
                isMostV: this.state.modalItemMostViewed,
                isNew: this.state.modalItemIsNew,
                name: this.state.modalItemTitle,
                quantity: this.state.modalItemQuantity,
                unitMeasure: this.state.modalItemUnitMeasure,
                unitPrice: this.state.modalItemPrice,
                id: this.state.selectedItemId
            }
            updatedItems[oldIndex] = updatedItem;
            this.setState({
                listItems: updatedItems
            },() => {
                this.toggleEditModal()
                this.changeCurrentPageItems(this.state.listItems,this.state.currentPageIndex)
                this.showMessage('item update sccussful!', 'success')
            })
        })
    }

    render(){
        return(
            <Container fluid className="p-0">

                <Modal isOpen={this.state.deleteModalShow}>
                    <ModalHeader toggle={() => this.toggleDeleteModal()}>Delete</ModalHeader>
                    <ModalBody>
                        Are you sure you want to delete {
                        this.state.selectedItemIndex ?
                        this.state.listItems[this.state.selectedItemIndex].name:
                        ''
                        }?
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => this.toggleDeleteModal()}>Cancel</Button>
                        <Button color="danger" onClick={() => this.deleteItem()}>
                            {
                                this.state.itemLoadingButton ?
                                <div className=""> <i className="fa fa-spinner fa-spin"></i> Processing</div> : 
                                <span>Delete</span>
                            }
                            </Button>
                    </ModalFooter>
                </Modal>
                <Modal isOpen={this.state.itemAddShow} >
                    <ModalHeader toggle={() => this.toggleAddItemModal()}>Add Item</ModalHeader>
                    <ModalBody>
                        <div className="my-1">
                            <img className="fadeIn" src={this.state.previewSrc} alt="item img"/>
                        </div>

                        {
                            this.state.uploadImageProgress ?
                            <span className="user-select-none fadeIn"><i className="fa fa-spinner fa-spin text-primary mx-1"></i></span>:
                            null
                        }

                        {
                            this.state.imageUpladeStatus === 'success' ?
                            <span className="user-select-none d-block">upload successful! <i className="icon-check mx-1"></i></span> :
                            (
                                this.state.imageUpladeStatus === '' ?
                                <span></span>:
                                <span className="user-select-none d-block">upload failed! <i className="icon-ban mx-1"></i></span>
                            )
                        }
                        <Input type="file" onChange={e => this.handleLoadAvatar(e)}/>
                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Name</InputGroupText>
                            </InputGroupAddon>
                            <Input value={this.state.modalItemTitle} onChange={e => this.setState({modalItemTitle: e.target.value})} />
                        </InputGroup>

                        <InputGroup className="mt-3" >
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Unit Price</InputGroupText>
                            </InputGroupAddon>
                            <Input type="number" value={this.state.modalItemPrice} onChange={e => this.setState({modalItemPrice: e.target.value})} />
                        </InputGroup>

                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Unit Measure</InputGroupText>
                            </InputGroupAddon>
                            <Input value={this.state.modalItemUnitMeasure} onChange={e => this.setState({modalItemUnitMeasure: e.target.value})} />
                        </InputGroup>

                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Quantity</InputGroupText>
                            </InputGroupAddon>
                            <Input value={this.state.modalItemQuantity} onChange={e => this.setState({modalItemQuantity: e.target.value})} />
                        </InputGroup>

                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Description</InputGroupText>
                            </InputGroupAddon>
                            <Input value={this.state.modalItemDescription} onChange={e => this.setState({modalItemDescription: e.target.value})} />
                        </InputGroup>

                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Image Alt</InputGroupText>
                            </InputGroupAddon>
                            <Input value={this.state.modalItemImgAlt} onChange={e => this.setState({modalItemImgAlt: e.target.value})} />
                        </InputGroup>

                        <Input type="select" className="mt-3" onChange={e => this.handleCategoryChange(e.target.value)}>
                            {
                                !this.state.categories.length ?
                                <option value="none">none</option>
                                :this.state.categories.map(item => {
                                    return <option key={item.id} value={item.id}>{ item.name }</option>
                                })
                            }
                        </Input>

                        <Row className="mt-3">
                            <Col>
                            <AppSwitch className={'mx-3 d-block'} variant={'3d'} color={'primary'} checked={this.state.modalItemIsNew} onChange={() => this.toggleModalItemIsNew()}  />
                            <span className="font-sm">Set as new item</span>
                            </Col>

                            <Col>
                            <AppSwitch className={'mx-3 d-block'} variant={'3d'} color={'primary'} checked={this.state.modalItemMostOrdered} onChange={() => this.toggleModalItemMostOrdered()}  />
                            <span className="font-sm">Set as most ordered</span>
                            </Col>

                            <Col>
                            <AppSwitch className={'mx-3 d-block'} variant={'3d'} color={'primary'} checked={this.state.modalItemMostViewed} onChange={() => this.toggleModalItemMostViewed()}  />
                            <span className="font-sm">Set as most viewed</span>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => this.toggleAddItemModal()}>Cancel</Button>
                        <Button color="primary" onClick={() => this.validate()}>
                        {
                            this.state.itemLoadingButton ?
                            <div className=""> <i className="fa fa-spinner fa-spin"></i> Processing</div> : 
                            <span>Add item</span>
                        }
                        </Button>
                    </ModalFooter>
                </Modal>

{/*=============================================================EDIT ITEM MODAL=================================================================================================================================*/}
                <Modal isOpen={this.state.editModalShow} >
                    <ModalHeader toggle={() => this.toggleAddItemModal()}>Add Item</ModalHeader>
                    <ModalBody>
                        <div className="my-1">
                            <img className="fadeIn" src={this.state.previewSrc} alt="item img"/>
                        </div>

                        {
                            this.state.uploadImageProgress ?
                            <span className="user-select-none fadeIn"><i className="fa fa-spinner fa-spin text-primary mx-1"></i></span>:
                            null
                        }

                        {
                            this.state.imageUpladeStatus === 'success' ?
                            <span className="user-select-none d-block">upload successful! <i className="icon-check mx-1"></i></span> :
                            (
                                this.state.imageUpladeStatus === '' ?
                                <span></span>:
                                <span className="user-select-none d-block">upload failed! <i className="icon-ban mx-1"></i></span>
                            )
                        }
                        <Input type="file" onChange={e => this.handleLoadAvatar(e)}/>
                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Name</InputGroupText>
                            </InputGroupAddon>
                            <Input value={this.state.modalItemTitle} onChange={e => this.setState({modalItemTitle: e.target.value})} />
                        </InputGroup>

                        <InputGroup className="mt-3" >
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Unit Price</InputGroupText>
                            </InputGroupAddon>
                            <Input type="number" value={this.state.modalItemPrice} onChange={e => this.setState({modalItemPrice: e.target.value})} />
                        </InputGroup>

                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Unit Measure</InputGroupText>
                            </InputGroupAddon>
                            <Input value={this.state.modalItemUnitMeasure} onChange={e => this.setState({modalItemUnitMeasure: e.target.value})} />
                        </InputGroup>

                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Quantity</InputGroupText>
                            </InputGroupAddon>
                            <Input value={this.state.modalItemQuantity} onChange={e => this.setState({modalItemQuantity: e.target.value})} />
                        </InputGroup>

                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Description</InputGroupText>
                            </InputGroupAddon>
                            <Input value={this.state.modalItemDescription} onChange={e => this.setState({modalItemDescription: e.target.value})} />
                        </InputGroup>

                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Image Alt</InputGroupText>
                            </InputGroupAddon>
                            <Input value={this.state.modalItemImgAlt} onChange={e => this.setState({modalItemImgAlt: e.target.value})} />
                        </InputGroup>

                        <Input type="select" defaultValue={this.state.modalItemCategoryId} className="mt-3" onChange={e => this.handleCategoryChange(e.target.value)}>
                            {
                                !this.state.categories.length ?
                                <option value="none">none</option>
                                :this.state.categories.map(item => {
                                    return <option key={item.id} value={item.id} >{ item.name }</option>
                                })
                            }
                        </Input>

                        <Row className="mt-3">
                            <Col>
                            <AppSwitch className={'mx-3 d-block'} variant={'3d'} color={'primary'} checked={this.state.modalItemIsNew} onChange={() => this.toggleModalItemIsNew()}  />
                            <span className="font-sm">Set as new item</span>
                            </Col>

                            <Col>
                            <AppSwitch className={'mx-3 d-block'} variant={'3d'} color={'primary'} checked={this.state.modalItemMostOrdered} onChange={() => this.toggleModalItemMostOrdered()}  />
                            <span className="font-sm">Set as most ordered</span>
                            </Col>

                            <Col>
                            <AppSwitch className={'mx-3 d-block'} variant={'3d'} color={'primary'} checked={this.state.modalItemMostViewed} onChange={() => this.toggleModalItemMostViewed()}  />
                            <span className="font-sm">Set as most viewed</span>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={() => this.toggleEditModal()}>Cancel</Button>
                        <Button color="primary" onClick={() => this.editItem()}>
                        {
                            this.state.itemLoadingButton ?
                            <div className=""> <i className="fa fa-spinner fa-spin"></i> Processing</div> : 
                            <span>Update item</span>
                        }
                        </Button>
                    </ModalFooter>
                </Modal>
                <Row className="m-3">
                    <Col sm={{size: 6, offset: 6}} lg={{size: 2, offset: 10}} md={{size: 3, offset: 6}} xs={{size: 10, offset: 7}}>
                        <Button color="primary" className="btn btn-primary" onClick={() => this.toggleAddItemModal()} ><i className="fa fa-plus text-white mr-2" ></i>Add Item</Button>
                    </Col>
                </Row>


                <Row>                    
                    <Col xs="12" lg="12">
                    <Card>
                    <CardHeader>
                        <i className="fa fa-align-justify"></i> Condensed Table
                    </CardHeader>
                    <CardBody>
                        <Table responsive size="sm">
                        <thead>
                        <tr>
                            <th>name</th>
                            <th>price</th>
                            <th>new</th>
                            <th>most ordered</th>
                            <th>most viewed</th>
                            <th>unit</th>
                            <th>category</th>
                            <th>actions</th>
                        </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.currentPageItems.map((item,index) => {
                                return <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{item.unitPrice} L.L</td>
                                        <td>
                                        {
                                            item.isNew ?
                                            <i className="cui-circle-check icons font-xl text-success" color="success"></i>:
                                            <i className="cui-circle-x icons font-xl text-danger"></i>
                                        }
                                        </td>
                                        <td>
                                            {
                                                item.isMostO ?
                                                <i className="cui-circle-check icons font-xl text-success" color="success"></i>:
                                                <i className="cui-circle-x icons font-xl text-danger"></i>
                                            }
                                        </td>
                                        <td>
                                            {
                                                item.isMostV?
                                                <i className="cui-circle-check icons font-xl text-success" color="success"></i>:
                                                <i className="cui-circle-x icons font-xl text-danger"></i>
                                            }
                                        </td>
                                        <td>{item.unitMeasure}</td>
                                        <td>
                                            {
                                            !this.state.categories.find(cat => cat.id === item.categoryId) ?
                                            "null" :
                                            this.state.categories.find(cat => cat.id === item.categoryId).name 
                                            }
                                        </td>
                                        <td>
                                            <ButtonGroup size="sm">
                                                <Button onClick={() => this.handleItemEdit(item,index)}><i className="cui-note icons font-xl d-block "></i></Button>
                                                <Button onClick={() => this.handleItemDelete(item.id, index)}><i className="cui-trash icons font-xl d-block text-danger >"></i></Button>
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                })
                            }
                        </tbody>
                        </Table>
                        <Pagination>
                        <PaginationItem><PaginationLink previous tag="button">Prev</PaginationLink></PaginationItem>
                            {
                                this.PaginationItems(this.state.pageCount)
                            }
                        <PaginationItem><PaginationLink next tag="button">Next</PaginationLink></PaginationItem>
                        </Pagination>
                    </CardBody>
                    </Card>
                </Col>
                </Row>

                <Alert color={this.state.messageMode} isOpen={this.state.messageVisible} toggle={() => this.setState({messageVisible: false})}>
                    {this.state.messageText}
                </Alert>
            </Container>
        )
    }

}

export default Items;