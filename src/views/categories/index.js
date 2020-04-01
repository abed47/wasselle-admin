import React,{Component} from 'react';
import {AiOutlineHome, AiOutlineCoffee} from 'react-icons/ai'
import {
    FaWineBottle,
    FaBreadSlice,
    FaAppleAlt,
    FaCarrot,
    FaPepperHot,
    FaLemon,
    FaPrescriptionBottleAlt,
    FaBirthdayCake
} from 'react-icons/fa'
import {
    IoIosPaw,
    IoIosWine,
    IoMdMedical,
    IoIosBasket,
    IoIosCart,
    IoIosGift,
    IoIosHeart
} from 'react-icons/io'
import {
    GiCheeseWedge,
    GiFruitBowl,
    GiWrappedSweet,
    GiCupcake,
    GiNoodles,
    GiCarrot,
    GiWheat,
    GiCakeSlice
} from 'react-icons/gi'
import {
    TiLightbulb,
    TiLeaf,
    TiPhoneOutline,
    TiThermometer
} from 'react-icons/ti'
import {
    Container,
    Col,
    Row,
    Table,
    ModalFooter,
    Modal,
    ModalHeader,
    ModalBody,
    Button,
    ButtonGroup,
    Card,
    CardBody,
    CardHeader,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Alert
} from 'reactstrap';
import {fb} from '../../firebase';
import {AppSwitch} from '@coreui/react';
import Joi from '@hapi/joi';

let validationSchema = Joi.object({
    categoryName: Joi.string().min(3).required(),
    categoryIcon: Joi.string().required(),
    isFetured: Joi.required()
})
let icons = [
    {name: 'house',
        icon: (<AiOutlineHome/>)},
    {name: 'bottle',
        icon: (<FaWineBottle/>)},
    {name: 'cheese',
        icon: (<GiCheeseWedge/>)},
    {name: 'bread',
        icon: (<FaBreadSlice/>)},
    {name: 'fruit',
        icon: (<GiFruitBowl/>)},
    {name: 'candy',
        icon: (<GiWrappedSweet/>)},
    {name: 'cup-cake',
        icon: (<GiCupcake/>)},
    {name: 'cake-slice',
        icon: (<GiCakeSlice/>)},
    {name: 'cake-bday',
        icon: (<FaBirthdayCake/>)},
    {name: 'medical',
        icon: (<IoMdMedical/>)},
    {name: 'medicen',
        icon: (<FaPrescriptionBottleAlt/>)},
    {name: 'basket',
        icon: (<IoIosBasket/>)},
    {name: 'cart',
        icon: (<IoIosCart/>)},
    {name: 'gift',
        icon: (<IoIosGift/>)},
    {name: 'carrot',
    icon: (<FaCarrot/>)},
    {name: 'carrot-alt',
    icon: (<GiCarrot/>)},
    {name: 'apple',
    icon: (<FaAppleAlt/>)},
    {name: 'lemon',
    icon: (<FaLemon/>)},
    {name: 'pepper',
    icon: (<FaPepperHot/>)},
    {name: 'wheat',
    icon: (<GiWheat/>)},
    {name: 'animal',
    icon: (<IoIosPaw/>)},
    {name: 'glass',
    icon: (<IoIosWine/>)},
    {name: 'bulb',
    icon: (<TiLightbulb/>)},
    {name: 'leaf',
    icon: (<TiLeaf/>)},
    {name: 'phone-hand',
    icon: (<TiPhoneOutline/>)},
    {name: 'thermometer',
        icon: (<TiThermometer/>)},
    {name: 'noodles',
    icon: (<GiNoodles/>)},
{    name: 'cup',
    icon: (<AiOutlineCoffee/>)}
]
class Categories extends Component{

    constructor(props){
        super(props);
        this.state = {
            listItems:[],
            showAddCategory:false,
            categoryName: '',
            categoryIcon: icons[0].name,
            categoryIsFeatured: false,
            selectedCategoryId:'',
            iconList: icons,
            proccessingIcon: false,
            alertMessage: '',
            alertMode: '',
            showAlert: false,
            modalAlertMode: '',
            modalAlertMessage:'',
            showModalAlert: false,
            selectedCategoryIndex: 0,
            showUpdateModal: false
        }
    }

    componentDidMount(){
        this.getData()
    }

    async getData(){
        let placeHolderArr = []
        fb.firestore()
        .collection('categories')
        .orderBy('name','desc')
        .get()
        .then(docs => {
            docs.forEach(doc => {
                let obj = doc.data();
                obj.id = doc.id;
                placeHolderArr.push(obj)
            })
        }).then(() => {
            this.setState({
                listItems: placeHolderArr
            })
        })
    }

    async addCategory(){
        fb.firestore()
        .collection('categories')
        .add({
            name: this.state.categoryName,
            isFeatured: this.state.categoryIsFeatured,
            iconName: this.state.categoryIcon
        }).then(snapshot => {
            let obj = {
                name: this.state.categoryName,
                isFeatured: this.state.categoryIsFeatured,
                iconName: this.state.categoryIcon,
                id: snapshot.id
            }
            let catHolder = this.state.listItems
            catHolder.unshift(obj)
            this.handleCategoryAdded()
        })
    }

    async updateCategory(){
        fb.firestore()
        .collection('categories')
        .doc(this.state.selectedCategoryId)
        .update({
            iconName: this.state.categoryIcon,
            isFeatured: this.state.categoryIsFeatured,
            name: this.state.categoryName
        }).then(() => {
            let updatedCat = this.state.listItems
            updatedCat[this.state.selectedCategoryIndex] = {
                iconName : this.state.categoryIcon,
                isFeatured: this.state.categoryIsFeatured,
                name: this.state.categoryName,
                id: this.state.selectedCategoryId
            }

            this.setState({
                listItems: updatedCat
            },() => {
                this.handleCategoryUpdated()
            })

        })
    }

    hideModal(){
        this.setState({
            categoryIcon: icons[0].name,
            categoryName: '',
            categoryIsFeatured: false,
            selectedCategoryId: '',
            showUpdateModal: false
        })
    }

    handleCategoryUpdated(){
        this.setState({
            categoryIcon: icons[0].name,
            categoryName: '',
            categoryIsFeatured: false,
            selectedCategoryId: '',
            showUpdateModal: false,
            selectedCategoryIndex: 0
        })

        this.showMessage('category updated!','success')
    }

    toggleUpdateModal(index){
        this.setState({
            categoryIcon: this.state.listItems[index].iconName,
            categoryName: this.state.listItems[index].name,
            categoryIsFeatured: this.state.listItems[index].isFeatured,
            selectedCategoryId: this.state.listItems[index].id,
            selectedCategoryIndex: index,
        },() => {
            this.setState({
                showUpdateModal: true
            })
        })
    }

    handleCategoryAdded(){
        this.setState({
            showAddCategory:false,
            categoryName: '',
            categoryIcon: icons[0].name,
            categoryIsFeatured: false,
            selectedCategoryId:'',
            iconList: icons,
            proccessingIcon: false,
            alertMessage: '',
            alertMode: '',
            showAlert: false,
            modalAlertMode: '',
            modalAlertMessage:'',
            showModalAlert: false
        })

        this.showMessage('category added successfuly!', 'success')
    }

    getIcon(name){
        switch(name){
            case 'house':
                return (<AiOutlineHome/>);
            case 'bottle':
                return (<FaWineBottle/>);
            case 'cheese':
                return (<GiCheeseWedge/>)
            case 'bread':
                return (<FaBreadSlice/>)
            case 'fruit':
                return (<GiFruitBowl/>)
            case 'candy':
                return (<GiWrappedSweet/>)
            case 'cup-cake':
                return (<GiCupcake/>)
            case 'cake-slice':
                return (<GiCakeSlice/>)
            case 'cake-bday':
                return (<FaBirthdayCake/>)
            case 'medical':
                return (<IoMdMedical/>)
            case 'medicen':
                return (<FaPrescriptionBottleAlt/>)
            case 'basket':
                return (<IoIosBasket/>)
            case 'cart':
                return (<IoIosCart/>)
            case 'gift':
                return (<IoIosGift/>)
            case 'carrot':
                return (<FaCarrot/>)
            case 'carrot-alt':
                return (<GiCarrot/>)
            case 'apple':
                return (<FaAppleAlt/>)
            case 'lemon':
                return (<FaLemon/>)
            case 'pepper':
                return (<FaPepperHot/>)
            case 'wheat':
                return (<GiWheat/>)
            case 'animal':
                return (<IoIosPaw/>)
            case 'glass':
                return (<IoIosWine/>)
            case 'bulb':
                return (<TiLightbulb/>)
            case 'leaf':
                return (<TiLeaf/>)
            case 'phone-hand':
                return (<TiPhoneOutline/>)
            case 'thermometer':
                return (<TiThermometer/>)
            case 'noodles':
                return (<GiNoodles/>)
            case 'cup':
                return (<AiOutlineCoffee/>)
            default:
                return(<IoIosHeart/>)
        }
    }

    validate(){
        let item = {
            categoryIcon : this.state.categoryIcon,
            categoryName: this.state.categoryName,
            isFetured: this.state.categoryIsFeatured
        }

        let vals = validationSchema.validate(item)

        if(!vals.error){
            this.setState({
                showModalAlert: false,
                proccessingButton: true
            })
            this.addCategory()
            return
        }

        this.showModalAlert(vals.error.message,'danger')

    }

    showModalAlert(message,mode){
        this.setState({
            modalAlertMessage: message,
            modalAlertMode: mode,
            showModalAlert: true
        })
    }

    showMessage(message,mode){
        this.setState({
            alertMessage: message,
            alertMode: mode,
            showAlert: true
        })
    }

    toggleAddCategoryModal(){
        this.setState({
            showAddCategory: !this.state.showAddCategory
        })
    }

    hidUpdateCategory(){
        this.setState({
            categoryIcon: icons[0].name,
            categoryName: '',
            categoryIsFeatured: false,
            selectedCategoryId: '',
            showUpdateModal: false,
            selectedCategoryIndex: 0
        })
    }
    toggleCategoryFeatured(){
        this.setState({
            categoryIsFeatured: !this.state.categoryIsFeatured
        })
    }

    render(){
        return(
            <Container>

                <Modal isOpen={this.state.showAddCategory}>
                    <ModalHeader toggle={() => this.setState({showAddCategory: false})}>Add Category</ModalHeader>
                    <ModalBody>
                        <Alert isOpen={this.state.showModalAlert} color={this.state.modalAlertMode} toggle={() => this.setState({showModalAlert: false})}>
                            {this.state.modalAlertMessage}
                        </Alert>
                        <Row>
                            <Col>
                            <div className="d-flex flex-wrap">
                                {
                                    this.state.iconList.map(item => {
                                        return <div key={item.name} className="text-center m-2">
                                            <span className="d-block">{item.icon}</span>
                                            <span className="d-block">{item.name}</span>
                                        </div>
                                    })
                                }
                                </div>
                            </Col>
                        </Row>
                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Name</InputGroupText>
                            </InputGroupAddon>
                            <Input value={this.state.categoryName} onChange={e => this.setState({categoryName: e.target.value})} />
                        </InputGroup>

                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Icon</InputGroupText>
                            </InputGroupAddon>
                            <Input type="select" defaultValue={this.state.iconList[0].name} onChange={e => this.setState({categoryIcon: e.target.value})}>
                                {
                                    this.state.iconList.map((item, index) => {
                                        return <option key={item.name} value={item.name}  >{item.name}</option>
                                    })
                                }
                            </Input>
                        </InputGroup>
                        <Row>
                        <Col className="mt-3">
                            <AppSwitch className={'mx-3 d-block'} variant={'3d'} color={'primary'} checked={this.state.categoryIsFeatured} onChange={() => this.toggleCategoryFeatured()}  />
                            <span className="font-sm">Featured category</span>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => this.toggleAddCategoryModal()}>Cancel</Button>
                        <Button color="primary" onClick={() => this.validate()}>
                            {
                                this.state.proccessingButton ?
                                <span><i className="fa fa-cog fa-spin"></i> Proccessing</span>:
                                <span>Add</span>
                            }
                        </Button>
                    </ModalFooter>
                </Modal>
                

                <Modal isOpen={this.state.showUpdateModal}>
                    <ModalHeader toggle={() => this.setState({showUpdateModal: false})}>Update Category</ModalHeader>
                    <ModalBody>
                        <Row>
                            <Col>
                            <div className="d-flex flex-wrap">
                                {
                                    this.state.iconList.map(item => {
                                        return <div key={item.name} className="text-center m-2">
                                            <span className="d-block">{item.icon}</span>
                                            <span className="d-block">{item.name}</span>
                                        </div>
                                    })
                                }
                                </div>
                            </Col>
                        </Row>
                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Name</InputGroupText>
                            </InputGroupAddon>
                            <Input value={this.state.categoryName} onChange={e => this.setState({categoryName: e.target.value})} />
                        </InputGroup>

                        <InputGroup className="mt-3">
                            <InputGroupAddon addonType="prepend">
                            <InputGroupText>Icon</InputGroupText>
                            </InputGroupAddon>
                            <Input type="select" defaultValue={this.state.iconList[0].name} onChange={e => this.setState({categoryIcon: e.target.value})}>
                                {
                                    this.state.iconList.map((item, index) => {
                                        return <option key={item.name} value={item.name}  >{item.name}</option>
                                    })
                                }
                            </Input>
                        </InputGroup>
                        <Row>
                        <Col className="mt-3">
                            <AppSwitch className={'mx-3 d-block'} variant={'3d'} color={'primary'} checked={this.state.categoryIsFeatured} onChange={() => this.toggleCategoryFeatured()}  />
                            <span className="font-sm">Featured category</span>
                            </Col>
                        </Row>
                    </ModalBody>
                    <ModalFooter>
                        <Button onClick={() => this.hidUpdateCategory()}>Cancel</Button>
                        <Button color="primary" onClick={() => this.updateCategory()}>
                            {
                                this.state.proccessingButton ?
                                <span><i className="fa fa-cog fa-spin"></i> Proccessing</span>:
                                <span>Update</span>
                            }
                        </Button>
                    </ModalFooter>
                </Modal>


                <Row>
                    <Col xs={{size: 6, offset: 6}} lg={{size: 4,offset:10}}>
                    <Button color="primary" onClick={() => this.toggleAddCategoryModal()}>
                        <i className="fa fa-plus px-1"></i>Add Category</Button>
                    </Col>
                </Row>

                <Row className="mt-4">
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
                            <th>icon</th>
                            <th>featured</th>
                            <th>action</th>
                        </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.listItems.map((item,index) => {
                                    return <tr key={item.id}>
                                        <td>{item.name}</td>
                                        <td>{this.getIcon(item.iconName)}</td>
                                        <td className="text-center">
                                            {
                                                item.isFeatured ? 
                                                <i className="cui-circle-check text-success"></i> :
                                                <i className="cui-ban text-danger"></i>
                                            }
                                        </td>
                                        <td>
                                            {
                                                (<ButtonGroup>
                                                    <Button onClick={() => this.toggleUpdateModal(index)}><i className="cui-note icons"></i></Button>
                                                </ButtonGroup>)
                                            }
                                        </td>
                                    </tr>
                                })
                            }
                        </tbody>
                        </Table>
                    </CardBody>
                    </Card>
                </Col>
                </Row>
                <Alert isOpen={this.state.showAlert} color={this.state.alertMode} toggle={() => this.setState({showAlert: false})}>
                    {this.state.alertMessage}
                </Alert>
            </Container>
        )
    }
}

export default Categories;